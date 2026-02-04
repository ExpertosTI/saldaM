import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Contact, ContactRole } from './entities/contact.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ContactsService {
    constructor(
        @InjectRepository(Contact)
        private contactsRepository: Repository<Contact>,
    ) { }

    async create(createContactDto: any, user: User) {
        const contact = this.contactsRepository.create({
            ...createContactDto,
            owner: user,
        });
        return this.contactsRepository.save(contact);
    }

    async findAll(user: User, options?: { search?: string; role?: ContactRole; favorite?: boolean }) {
        const where: any = { owner: { id: user.id } };

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
            contacts = contacts.filter(c =>
                c.name?.toLowerCase().includes(searchLower) ||
                c.email?.toLowerCase().includes(searchLower) ||
                c.pro?.toLowerCase().includes(searchLower)
            );
        }

        return contacts;
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

    async update(id: string, userId: string, data: any) {
        const contact = await this.contactsRepository.findOne({
            where: { id },
            relations: ['owner'],
        });
        if (!contact) throw new NotFoundException('Contact not found');
        if (contact.owner?.id !== userId) {
            throw new ForbiddenException('Unauthorized: You do not own this contact');
        }
        Object.assign(contact, data);
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
                case ContactRole.SONGWRITER: stats.byRole.songwriter++; break;
                case ContactRole.PRODUCER: stats.byRole.producer++; break;
                case ContactRole.PUBLISHER: stats.byRole.publisher++; break;
                case ContactRole.ARTIST: stats.byRole.artist++; break;
                default: stats.byRole.other++;
            }
        }

        return stats;
    }
}
