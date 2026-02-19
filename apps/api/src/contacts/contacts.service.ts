import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact, ContactRole } from './entities/contact.entity';
import type { User } from '../user/entities/user.entity';

type CreateContactDto = {
  name: string;
  email?: string;
  phone?: string;
  ipiNumber?: string;
  pro?: string;
  publishingCompany?: string;
  role?: ContactRole;
  notes?: string;
  isFavorite?: boolean;
};

type UpdateContactDto = Partial<CreateContactDto>;

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);
  constructor(
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
  ) {}

  async create(createContactDto: CreateContactDto, user: Pick<User, 'id'>) {
    const contact = this.contactsRepository.create({
      ...createContactDto,
      owner: user,
    });
    return this.contactsRepository.save(contact);
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
        favorites: 0,
      };

      for (const contact of contacts) {
        if (contact.isFavorite) stats.favorites++;
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
