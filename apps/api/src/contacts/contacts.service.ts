import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
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

    async findAll(user: User) {
        return this.contactsRepository.find({
            where: { owner: { id: user.id } },
        });
    }

    async findOne(id: string, userId: string) {
        const contact = await this.contactsRepository.findOne({
            where: { id },
            relations: ['owner'],
        });
        if (!contact) throw new Error('Contact not found');
        if (contact.owner?.id !== userId) {
            throw new Error('Unauthorized: You do not own this contact');
        }
        return contact;
    }

    async update(id: string, userId: string, data: any) {
        const contact = await this.contactsRepository.findOne({
            where: { id },
            relations: ['owner'],
        });
        if (!contact) throw new Error('Contact not found');
        if (contact.owner?.id !== userId) {
            throw new Error('Unauthorized: You do not own this contact');
        }
        Object.assign(contact, data);
        return this.contactsRepository.save(contact);
    }

    async delete(id: string, userId: string) {
        const contact = await this.contactsRepository.findOne({
            where: { id },
            relations: ['owner'],
        });
        if (!contact) throw new Error('Contact not found');
        if (contact.owner?.id !== userId) {
            throw new Error('Unauthorized: You do not own this contact');
        }
        await this.contactsRepository.remove(contact);
        return { message: 'Contact deleted successfully' };
    }
}
