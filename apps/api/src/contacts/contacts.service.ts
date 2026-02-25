import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact, ContactRole, ContactStatus } from './entities/contact.entity';
import { User } from '../user/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

type CreateContactDto = {
  name?: string;
  email?: string;
  phone?: string;
  role?: ContactRole;
  notes?: string;
};

type UpdateContactDto = {
  name?: string;
  email?: string;
  phone?: string;
  ipiNumber?: string;
  pro?: string;
  publishingCompany?: string;
  role?: ContactRole;
  notes?: string;
  isFavorite?: boolean;
};

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);
  constructor(
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) { }

  /**
   * Create a contact. If the email belongs to an existing user,
   * send a CONNECTION REQUEST (not auto-connect).
   */
  async create(createContactDto: CreateContactDto, owner: Pick<User, 'id'>) {
    if (!createContactDto.email && !createContactDto.phone) {
      throw new BadRequestException(
        'Se requiere al menos un email o número de teléfono.',
      );
    }

    const ownerUser = await this.userRepository.findOne({
      where: { id: owner.id },
    });
    const ownerName = ownerUser
      ? [ownerUser.firstName, ownerUser.lastName].filter(Boolean).join(' ').trim() || ownerUser.email
      : 'Un usuario';

    // Check if email belongs to an existing user
    let existingUser: User | null = null;
    if (createContactDto.email) {
      existingUser = await this.userRepository.findOne({
        where: { email: createContactDto.email },
      });
    }

    const displayName =
      createContactDto.name ||
      (existingUser
        ? [existingUser.firstName, existingUser.lastName].filter(Boolean).join(' ').trim()
        : null) ||
      createContactDto.email ||
      createContactDto.phone ||
      'Contacto';

    // If existing user → REQUEST_SENT (needs acceptance)
    // If not on platform → PENDING (waiting for registration)
    const contact = this.contactsRepository.create({
      name: displayName,
      email: createContactDto.email || null,
      phone: createContactDto.phone || null,
      role: createContactDto.role || ContactRole.OTHER,
      notes: createContactDto.notes || null,
      status: existingUser ? ContactStatus.REQUEST_SENT : ContactStatus.PENDING,
      linkedUserId: existingUser?.id || null,
      linkedAt: null, // Only set when accepted
      linkedUserAvatar: null, // Only shown when accepted
      owner: { id: owner.id } as User,
    } as Partial<Contact>);

    const savedContact = await this.contactsRepository.save(contact);

    // Send in-app notification to existing user
    if (existingUser) {
      try {
        await this.notificationsService.create({
          recipientId: existingUser.id,
          type: NotificationType.CONNECTION_REQUEST,
          title: '🤝 Solicitud de conexión',
          message: `${ownerName} quiere conectarse contigo.`,
          actionUrl: '/dashboard/notifications',
          fromUserId: owner.id,
          fromUserName: ownerName,
          fromUserAvatar: ownerUser?.avatarUrl || undefined,
        });
      } catch (err: unknown) {
        this.logger.warn('Could not send connection notification', err);
      }
    }

    // Send email invite (always when email provided)
    if (createContactDto.email) {
      const inviteLink = existingUser
        ? `${process.env.APP_WEB_URL || 'https://app.saldanamusic.com'}/dashboard/notifications`
        : `${process.env.APP_WEB_URL || 'https://app.saldanamusic.com'}/register?ref=${owner.id}`;
      try {
        await this.mailService.sendGlobalInvite(
          createContactDto.email,
          ownerName,
          inviteLink,
        );
        this.logger.log(`Invite email sent to ${createContactDto.email}`);
      } catch (err: unknown) {
        this.logger.error(
          `Failed to send invite email to ${createContactDto.email}`,
          err instanceof Error ? err.stack : String(err),
        );
      }
    }

    return {
      ...savedContact,
      isExistingUser: !!existingUser,
    };
  }

  /**
   * Accept a connection request.
   * Called by the RECIPIENT (the person who received the request).
   */
  async acceptRequest(contactId: string, acceptingUserId: string) {
    // Find the contact where acceptingUser is the linkedUser
    const contact = await this.contactsRepository.findOne({
      where: { id: contactId },
      relations: ['owner'],
    });

    if (!contact) throw new NotFoundException('Solicitud no encontrada.');
    if (contact.linkedUserId !== acceptingUserId) {
      throw new ForbiddenException('No tienes permiso para aceptar esta solicitud.');
    }
    if (contact.status !== ContactStatus.REQUEST_SENT) {
      throw new BadRequestException('Esta solicitud ya fue procesada.');
    }

    // Accept: update to CONNECTED
    const acceptingUser = await this.userRepository.findOne({
      where: { id: acceptingUserId },
    });

    contact.status = ContactStatus.CONNECTED;
    contact.linkedAt = new Date();
    if (acceptingUser?.avatarUrl) contact.linkedUserAvatar = acceptingUser.avatarUrl;

    // Fill in professional data
    if (acceptingUser) {
      const fullName = [acceptingUser.firstName, acceptingUser.lastName]
        .filter(Boolean).join(' ').trim();
      if (fullName) contact.name = fullName;
      if (acceptingUser.ipiNumber) contact.ipiNumber = acceptingUser.ipiNumber;
      if (acceptingUser.proAffiliation) contact.pro = acceptingUser.proAffiliation;
      if (acceptingUser.publishingCompany) contact.publishingCompany = acceptingUser.publishingCompany;
    }

    await this.contactsRepository.save(contact);

    // Also create a reverse contact for the accepting user
    const reverseContact = this.contactsRepository.create({
      name: contact.owner
        ? [contact.owner.firstName, contact.owner.lastName].filter(Boolean).join(' ').trim() || contact.owner.email
        : 'Contacto',
      email: contact.owner?.email || undefined,
      role: ContactRole.OTHER,
      status: ContactStatus.CONNECTED,
      linkedUserId: contact.owner?.id || null,
      linkedAt: new Date(),
      linkedUserAvatar: contact.owner?.avatarUrl || null,
      owner: { id: acceptingUserId } as User,
    } as unknown as Partial<Contact>);

    // Fill reverse with owner professional data
    if (contact.owner) {
      if (contact.owner.ipiNumber) reverseContact.ipiNumber = contact.owner.ipiNumber;
      if (contact.owner.proAffiliation) reverseContact.pro = contact.owner.proAffiliation;
    }

    await this.contactsRepository.save(reverseContact);

    // Notify the original sender
    if (contact.owner?.id) {
      const acceptingName = acceptingUser
        ? [acceptingUser.firstName, acceptingUser.lastName].filter(Boolean).join(' ').trim() || acceptingUser.email
        : 'Tu contacto';
      try {
        await this.notificationsService.create({
          recipientId: contact.owner.id,
          type: NotificationType.CONNECTION_ACCEPTED,
          title: '🎉 ¡Conexión aceptada!',
          message: `${acceptingName} aceptó tu solicitud de conexión.`,
          actionUrl: '/dashboard/collaborators',
          fromUserId: acceptingUserId,
          fromUserName: acceptingName,
          fromUserAvatar: acceptingUser?.avatarUrl || undefined,
        });
      } catch (err: unknown) {
        this.logger.warn('Could not send acceptance notification', err);
      }
    }

    return { message: 'Conexión aceptada exitosamente.' };
  }

  /**
   * Reject a connection request.
   */
  async rejectRequest(contactId: string, rejectingUserId: string) {
    const contact = await this.contactsRepository.findOne({
      where: { id: contactId },
    });

    if (!contact) throw new NotFoundException('Solicitud no encontrada.');
    if (contact.linkedUserId !== rejectingUserId) {
      throw new ForbiddenException('No tienes permiso.');
    }
    if (contact.status !== ContactStatus.REQUEST_SENT) {
      throw new BadRequestException('Esta solicitud ya fue procesada.');
    }

    // Remove the contact entirely
    await this.contactsRepository.remove(contact);
    return { message: 'Solicitud rechazada.' };
  }

  /**
   * Get pending requests FOR the current user (requests others sent to them)
   */
  async getPendingRequests(userId: string) {
    const requests = await this.contactsRepository.find({
      where: {
        linkedUserId: userId,
        status: ContactStatus.REQUEST_SENT,
      },
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });

    return requests.map((r) => ({
      id: r.id,
      fromUser: {
        id: r.owner?.id,
        name: r.owner
          ? [r.owner.firstName, r.owner.lastName].filter(Boolean).join(' ').trim() || r.owner.email
          : 'Desconocido',
        email: r.owner?.email || '',
        avatar: r.owner?.avatarUrl || null,
        userType: r.owner?.userType || null,
      },
      createdAt: r.createdAt,
    }));
  }

  /**
   * Called when a new user registers. Links PENDING contacts (those waiting for registration).
   * Does NOT auto-connect — changes status to REQUEST_SENT.
   */
  async linkContactsOnRegistration(registeredUser: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    ipiNumber?: string | null;
    proAffiliation?: string | null;
    publishingCompany?: string | null;
    userType?: string | null;
  }) {
    try {
      const pendingContacts = await this.contactsRepository.find({
        where: {
          email: registeredUser.email,
          status: ContactStatus.PENDING,
        },
        relations: ['owner'],
      });

      if (pendingContacts.length === 0) return;

      const fullName = [registeredUser.firstName, registeredUser.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

      for (const contact of pendingContacts) {
        contact.linkedUserId = registeredUser.id;
        contact.status = ContactStatus.REQUEST_SENT; // Needs acceptance!

        if (fullName) contact.name = fullName;

        // Send notification to the new user about pending requests
        try {
          const ownerName = contact.owner
            ? [contact.owner.firstName, contact.owner.lastName].filter(Boolean).join(' ').trim() || contact.owner.email
            : 'Un usuario';

          await this.notificationsService.create({
            recipientId: registeredUser.id,
            type: NotificationType.CONNECTION_REQUEST,
            title: '🤝 Solicitud de conexión',
            message: `${ownerName} quiere conectarse contigo.`,
            actionUrl: '/dashboard/notifications',
            fromUserId: contact.owner?.id,
            fromUserName: ownerName,
            fromUserAvatar: contact.owner?.avatarUrl || undefined,
          });
        } catch (err: unknown) {
          this.logger.warn('Could not notify registered user about pending request', err);
        }
      }

      await this.contactsRepository.save(pendingContacts);
      this.logger.log(
        `Linked ${pendingContacts.length} contacts for user ${registeredUser.email} (as REQUEST_SENT)`,
      );
    } catch (error: unknown) {
      this.logger.error(
        'Error linking contacts on registration',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async findAll(
    user: Pick<User, 'id'>,
    options?: { search?: string; role?: ContactRole; favorite?: boolean },
  ) {
    try {
      const where = { owner: { id: user.id } } as unknown as {
        owner: { id: string };
        role?: ContactRole;
        isFavorite?: boolean;
      };

      if (options?.role) where.role = options.role;
      if (options?.favorite !== undefined) where.isFavorite = options.favorite;

      let contacts = await this.contactsRepository.find({
        where,
        order: { createdAt: 'DESC' },
      });

      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        contacts = contacts.filter(
          (c) =>
            c.name?.toLowerCase().includes(searchLower) ||
            c.email?.toLowerCase().includes(searchLower) ||
            c.pro?.toLowerCase().includes(searchLower),
        );
      }

      // Sort: connected first, then request_sent, then pending
      contacts.sort((a, b) => {
        const order: Record<string, number> = { CONNECTED: 0, REQUEST_SENT: 1, PENDING: 2, BLOCKED: 3 };
        return (order[a.status] ?? 9) - (order[b.status] ?? 9);
      });

      // For non-connected contacts, hide professional data
      return contacts.map((c) => {
        if (c.status !== ContactStatus.CONNECTED) {
          return {
            ...c,
            ipiNumber: null,
            pro: null,
            publishingCompany: null,
            linkedUserAvatar: null,
          };
        }
        return c;
      });
    } catch (error: unknown) {
      this.logger.error('Error in ContactsService.findAll', error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }

  async findOne(id: string, userId: string) {
    const contact = await this.contactsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!contact) throw new NotFoundException('Contact not found');
    if (contact.owner?.id !== userId) {
      throw new ForbiddenException('Unauthorized');
    }
    return contact;
  }

  async update(id: string, userId: string, data: UpdateContactDto) {
    const contact = await this.contactsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!contact) throw new NotFoundException('Contact not found');
    if (contact.owner?.id !== userId) throw new ForbiddenException('Unauthorized');

    if (data.name !== undefined) contact.name = data.name;
    if (data.email !== undefined) contact.email = data.email;
    if (data.phone !== undefined) contact.phone = data.phone;
    if (data.ipiNumber !== undefined) contact.ipiNumber = data.ipiNumber;
    if (data.pro !== undefined) contact.pro = data.pro;
    if (data.publishingCompany !== undefined) contact.publishingCompany = data.publishingCompany;
    if (data.role !== undefined) contact.role = data.role;
    if (data.notes !== undefined) contact.notes = data.notes;
    if (data.isFavorite !== undefined) contact.isFavorite = data.isFavorite;
    return this.contactsRepository.save(contact);
  }

  async toggleFavorite(id: string, userId: string) {
    const contact = await this.findOne(id, userId);
    contact.isFavorite = !contact.isFavorite;
    return this.contactsRepository.save(contact);
  }

  async delete(id: string, userId: string) {
    const contact = await this.contactsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!contact) throw new NotFoundException('Contact not found');
    if (contact.owner?.id !== userId) throw new ForbiddenException('Unauthorized');
    await this.contactsRepository.remove(contact);
    return { message: 'Contact deleted successfully' };
  }

  async sendInvite(id: string, userId: string) {
    const contact = await this.findOne(id, userId);

    const ownerUser = await this.userRepository.findOne({ where: { id: userId } });
    const ownerName = ownerUser
      ? [ownerUser.firstName, ownerUser.lastName].filter(Boolean).join(' ').trim() || ownerUser.email
      : 'Un colega';

    const inviteLink = contact.linkedUserId
      ? `${process.env.APP_WEB_URL || 'https://app.saldanamusic.com'}/dashboard/notifications`
      : `${process.env.APP_WEB_URL || 'https://app.saldanamusic.com'}/register?ref=${userId}`;

    let emailSent = false;
    if (contact.email) {
      try {
        await this.mailService.sendGlobalInvite(
          contact.email,
          ownerName,
          inviteLink,
        );
        emailSent = true;
        this.logger.log(`Re-invite email sent to ${contact.email}`);
      } catch (err: unknown) {
        this.logger.error(
          `Failed to send re-invite email to ${contact.email}`,
          err instanceof Error ? err.stack : String(err),
        );
      }
    }

    return {
      message: emailSent ? 'Invitación enviada por email.' : 'Link de invitación generado.',
      link: inviteLink,
      emailSent,
    };
  }

  async getStats(userId: string) {
    try {
      const contacts = await this.contactsRepository.find({
        where: { owner: { id: userId } },
      });

      const stats = {
        total: contacts.length,
        byRole: { songwriter: 0, producer: 0, publisher: 0, artist: 0, other: 0 },
        byStatus: { pending: 0, connected: 0, requestSent: 0 },
        favorites: 0,
      };

      for (const contact of contacts) {
        if (contact.isFavorite) stats.favorites++;
        if (contact.status === ContactStatus.CONNECTED) stats.byStatus.connected++;
        else if (contact.status === ContactStatus.REQUEST_SENT) stats.byStatus.requestSent++;
        else stats.byStatus.pending++;

        switch (contact.role) {
          case ContactRole.SONGWRITER: stats.byRole.songwriter++; break;
          case ContactRole.PRODUCER: stats.byRole.producer++; break;
          case ContactRole.PUBLISHER: stats.byRole.publisher++; break;
          case ContactRole.ARTIST: stats.byRole.artist++; break;
          default: stats.byRole.other++;
        }
      }

      return stats;
    } catch (error: unknown) {
      this.logger.error('Error in ContactsService.getStats', error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }
}
