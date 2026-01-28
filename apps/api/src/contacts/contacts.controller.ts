import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Post()
    create(@Body() body: any) {
        // Mock user for now
        return this.contactsService.create(body, { id: body.userId } as any);
    }

    @Get('user/:userId')
    findAll(@Param('userId') userId: string) {
        return this.contactsService.findAll({ id: userId } as any);
    }
}
