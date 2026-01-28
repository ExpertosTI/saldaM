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
}
