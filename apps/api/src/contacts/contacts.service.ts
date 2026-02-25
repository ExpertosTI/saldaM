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
   * Simplified create: only email OR phone required.
   * Auto-detects if the email belongs to an existing user.
   */
  async create(createContactDto: CreateContactDto, owner: Pick<User, 'id'>) {
    if (!createContactDto.email && !createContactDto.phone) {
      throw new BadRequestException(
        'Se requiere al menos un email o número de teléfono.',
      );
    }

    // Get owner details for notifications
    const ownerUser = await this.userRepository.findOne({
      where: { id: owner.id },
    });
    const ownerName = ownerUser
      ? [ownerUser.firstName, ownerUser.lastName].filter(Boolean).join(' ').trim() || ownerUser.email
      : 'Un usuario';

    // Auto-detect: check if email belongs to an existing user
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

    const contact = this.contactsRepository.create({
      name: displayName,
      email: createContactDto.email || null,
      phone: createContactDto.phone || null,
      role: createContactDto.role || ContactRole.OTHER,
      notes: createContactDto.notes || null,
      status: existingUser ? ContactStatus.CONNECTED : ContactStatus.PENDING,
      linkedUserId: existingUser?.id || null,
      linkedAt: existingUser ? new Date() : null,
      linkedUserAvatar: existingUser?.avatarUrl || null,
      owner: { id: owner.id } as User,
    } as Partial<Contact>);

    // Auto-fill professional data if user exists
    if (existingUser) {
      if (existingUser.ipiNumber) contact.ipiNumber = existingUser.ipiNumber;
      if (existingUser.proAffiliation) contact.pro = existingUser.proAffiliation;
      if (existingUser.publishingCompany) contact.publishingCompany = existingUser.publishingCompany;

      // Map userType to role
      if (existingUser.userType) {
        const roleMap: Record<string, ContactRole> = {
          ARTIST: ContactRole.ARTIST,
          PRODUCER: ContactRole.PRODUCER,
          PUBLISHER: ContactRole.PUBLISHER,
        };
        if (roleMap[existingUser.userType]) {
          contact.role = roleMap[existingUser.userType];
        }
      }
    }

    const savedContact = await this.contactsRepository.save(contact);

    // Send in-app notification if user exists
    if (existingUser) {
      try {
        await this.notificationsService.create({
          recipientId: existingUser.id,
          type: NotificationType.CONNECTION_REQUEST,
          title: '🤝 Nueva conexión',
          message: `${ownerName} te ha agregado a su red de colaboradores.`,
          actionUrl: '/dashboard/collaborators',
          fromUserId: owner.id,
          fromUserName: ownerName,
          fromUserAvatar: ownerUser?.avatarUrl || undefined,
        });
      } catch (err: unknown) {
        this.logger.warn('Could not send connection notification', err);
      }
    }

    // Send email invite if email provided (always — whether user exists or not)
    if (createContactDto.email) {
      const inviteLink = existingUser
        ? `${process.env.APP_WEB_URL || 'https://app.saldanamusic.com'}/dashboard`
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
   * Called when a new user registers. Links all pending contacts.
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
        contact.status = ContactStatus.CONNECTED;
        contact.linkedAt = new Date();
        if (fullName) contact.name = fullName;
        if (registeredUser.avatarUrl) contact.linkedUserAvatar = registeredUser.avatarUrl;
        if (registeredUser.ipiNumber) contact.ipiNumber = registeredUser.ipiNumber;
        if (registeredUser.proAffiliation) contact.pro = registeredUser.proAffiliation;
        if (registeredUser.publishingCompany) contact.publishingCompany = registeredUser.publishingCompany;

        if (registeredUser.userType) {
          const roleMap: Record<string, ContactRole> = {
            ARTIST: ContactRole.ARTIST,
            PRODUCER: ContactRole.PRODUCER,
            PUBLISHER: ContactRole.PUBLISHER,
          };
          const mappedRole = roleMap[registeredUser.userType];
          if (mappedRole) contact.role = mappedRole;
        }

        // Notify the contact owner that their contact has joined
        if (contact.owner?.id) {
          try {
            await this.notificationsService.create({
              recipientId: contact.owner.id,
              type: NotificationType.CONNECTION_ACCEPTED,
              title: '🎉 ¡Conexión establecida!',
              message: `${fullName || registeredUser.email} se ha registrado y ya está conectado contigo.`,
              actionUrl: '/dashboard/collaborators',
              fromUserId: registeredUser.id,
              fromUserName: fullName || registeredUser.email,
              fromUserAvatar: registeredUser.avatarUrl || undefined,
            });
          } catch (err: unknown) {
            this.logger.warn('Could not send connection accepted notification', err);
          }
        }
      }

      await this.contactsRepository.save(pendingContacts);
      this.logger.log(
        `Linked ${pendingContacts.length} contacts for user ${registeredUser.email}`,
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

      // Sort: connected first, then pending
      contacts.sort((a, b) => {
        if (a.status === ContactStatus.CONNECTED && b.status !== ContactStatus.CONNECTED) return -1;
        if (a.status !== ContactStatus.CONNECTED && b.status === ContactStatus.CONNECTED) return 1;
        return 0;
      });

      return contacts;
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

  /**
   * Re-send invite email and WhatsApp link
   */
  async sendInvite(id: string, userId: string) {
    const contact = await this.findOne(id, userId);

    const ownerUser = await this.userRepository.findOne({ where: { id: userId } });
    const ownerName = ownerUser
      ? [ownerUser.firstName, ownerUser.lastName].filter(Boolean).join(' ').trim() || ownerUser.email
      : 'Un colega';

    const inviteLink = contact.linkedUserId
      ? `${process.env.APP_WEB_URL || 'https://app.saldanamusic.com'}/dashboard`
      : `${process.env.APP_WEB_URL || 'https://app.saldanamusic.com'}/register?ref=${userId}`;

    // Send email if available
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

    // Send in-app notification if user is connected
    if (contact.linkedUserId) {
      try {
        await this.notificationsService.create({
          recipientId: contact.linkedUserId,
          type: NotificationType.INVITE_SENT,
          title: '📩 Recordatorio de invitación',
          message: `${ownerName} te ha enviado un recordatorio para conectarse contigo.`,
          actionUrl: '/dashboard/collaborators',
          fromUserId: userId,
          fromUserName: ownerName,
          fromUserAvatar: ownerUser?.avatarUrl || undefined,
        });
      } catch (err: unknown) {
        this.logger.warn('Could not send re-invite notification', err);
      }
    }

    return {
      message: emailSent
        ? 'Invitación enviada por email exitosamente.'
        : 'Link de invitación generado.',
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
        byStatus: { pending: 0, connected: 0 },
        favorites: 0,
      };

      for (const contact of contacts) {
        if (contact.isFavorite) stats.favorites++;
        if (contact.status === ContactStatus.CONNECTED) stats.byStatus.connected++;
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
