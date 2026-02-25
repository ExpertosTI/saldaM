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
    private mailService: MailService,
  ) { }

  /**
   * Simplified create: only email OR phone required.
   * Name and role are optional.
   */
  async create(createContactDto: CreateContactDto, user: Pick<User, 'id'>) {
    if (!createContactDto.email && !createContactDto.phone) {
      throw new BadRequestException(
        'Se requiere al menos un email o número de teléfono.',
      );
    }

    // Auto-generate a display name if not provided
    const displayName =
      createContactDto.name ||
      createContactDto.email ||
      createContactDto.phone ||
      'Contacto';

    const contact = this.contactsRepository.create({
      name: displayName,
      email: createContactDto.email || null,
      phone: createContactDto.phone || null,
      role: createContactDto.role || ContactRole.OTHER,
      notes: createContactDto.notes || null,
      status: ContactStatus.PENDING,
      owner: { id: user.id } as User,
    } as Partial<Contact>);

    const savedContact = await this.contactsRepository.save(contact);

    // Auto-send invite if email is provided
    if (createContactDto.email) {
      const inviteLink = `${process.env.APP_WEB_URL || 'https://app.saldanamusic.com'}/register?ref=${user.id}`;
      try {
        await this.mailService.sendGlobalInvite(
          createContactDto.email,
          displayName,
          inviteLink,
        );
      } catch (err: unknown) {
        this.logger.warn(
          `Could not send auto-invite to ${createContactDto.email}`,
          err,
        );
      }
    }

    return savedContact;
  }

  /**
   * Called when a new user registers. Finds all pending contacts
   * with matching email and links them to the new user.
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
      // Find all pending contacts that match this email
      const pendingContacts = await this.contactsRepository.find({
        where: {
          email: registeredUser.email,
          status: ContactStatus.PENDING,
        },
      });

      if (pendingContacts.length === 0) return;

      const fullName = [registeredUser.firstName, registeredUser.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

      for (const contact of pendingContacts) {
        // Link the contact to the registered user
        contact.linkedUserId = registeredUser.id;
        contact.status = ContactStatus.CONNECTED;
        contact.linkedAt = new Date();

        // Auto-fill profile data from the registered user
        if (fullName) contact.name = fullName;
        if (registeredUser.avatarUrl)
          contact.linkedUserAvatar = registeredUser.avatarUrl;
        if (registeredUser.ipiNumber)
          contact.ipiNumber = registeredUser.ipiNumber;
        if (registeredUser.proAffiliation)
          contact.pro = registeredUser.proAffiliation;
        if (registeredUser.publishingCompany)
          contact.publishingCompany = registeredUser.publishingCompany;

        // Map userType to ContactRole
        if (registeredUser.userType) {
          const roleMap: Record<string, ContactRole> = {
            ARTIST: ContactRole.ARTIST,
            PRODUCER: ContactRole.PRODUCER,
            PUBLISHER: ContactRole.PUBLISHER,
            COMPOSER: ContactRole.SONGWRITER,
          };
          const mappedRole = roleMap[registeredUser.userType];
          if (mappedRole) contact.role = mappedRole;
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

      if (options?.role) {
        where.role = options.role;
      }

      if (options?.favorite !== undefined) {
        where.isFavorite = options.favorite;
      }

      let contacts = await this.contactsRepository.find({
        where,
        order: { name: 'ASC' },
      });

      // Filter by search if provided (name or email)
      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        contacts = contacts.filter(
          (c) =>
            c.name?.toLowerCase().includes(searchLower) ||
            c.email?.toLowerCase().includes(searchLower) ||
            c.pro?.toLowerCase().includes(searchLower),
        );
      }

      return contacts;
    } catch (error: unknown) {
      this.logger.error(
        'Error in ContactsService.findAll',
        error instanceof Error ? error.stack : String(error),
      );
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
      throw new ForbiddenException('Unauthorized: You do not own this contact');
    }
    return contact;
  }

  async update(id: string, userId: string, data: UpdateContactDto) {
    const contact = await this.contactsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!contact) throw new NotFoundException('Contact not found');
    if (contact.owner?.id !== userId) {
      throw new ForbiddenException('Unauthorized: You do not own this contact');
    }
    if (data.name !== undefined) contact.name = data.name;
    if (data.email !== undefined) contact.email = data.email;
    if (data.phone !== undefined) contact.phone = data.phone;
    if (data.ipiNumber !== undefined) contact.ipiNumber = data.ipiNumber;
    if (data.pro !== undefined) contact.pro = data.pro;
    if (data.publishingCompany !== undefined)
      contact.publishingCompany = data.publishingCompany;
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
    if (contact.owner?.id !== userId) {
      throw new ForbiddenException('Unauthorized: You do not own this contact');
    }
    await this.contactsRepository.remove(contact);
    return { message: 'Contact deleted successfully' };
  }

  async sendInvite(id: string, userId: string) {
    const contact = await this.findOne(id, userId);
    if (!contact) throw new NotFoundException('Contact not found');

    const ownerName = contact.owner?.firstName
      ? `${contact.owner.firstName} ${contact.owner.lastName || ''}`.trim()
      : contact.owner?.email || 'Un colega';

    const inviteLink = `${process.env.APP_WEB_URL || 'https://app.saldanamusic.com'}/register?ref=${userId}`;

    if (contact.email) {
      try {
        await this.mailService.sendGlobalInvite(
          contact.email,
          ownerName,
          inviteLink,
        );
      } catch (err: unknown) {
        this.logger.error(
          `Failed to send global invite to ${contact.email}`,
          err,
        );
      }
    }

    return { message: 'Invitación enviada exitosamente', link: inviteLink };
  }

  async getStats(userId: string) {
    try {
      const contacts = await this.contactsRepository.find({
        where: { owner: { id: userId } },
      });

      const stats = {
        total: contacts.length,
        byRole: {
          songwriter: 0,
          producer: 0,
          publisher: 0,
          artist: 0,
          other: 0,
        },
        byStatus: {
          pending: 0,
          connected: 0,
        },
        favorites: 0,
      };

      for (const contact of contacts) {
        if (contact.isFavorite) stats.favorites++;

        // Count by status
        if (contact.status === ContactStatus.CONNECTED) {
          stats.byStatus.connected++;
        } else {
          stats.byStatus.pending++;
        }

        switch (contact.role) {
          case ContactRole.SONGWRITER:
            stats.byRole.songwriter++;
            break;
          case ContactRole.PRODUCER:
            stats.byRole.producer++;
            break;
          case ContactRole.PUBLISHER:
            stats.byRole.publisher++;
            break;
          case ContactRole.ARTIST:
            stats.byRole.artist++;
            break;
          default:
            stats.byRole.other++;
        }
      }

      return stats;
    } catch (error: unknown) {
      this.logger.error(
        'Error in ContactsService.getStats',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
