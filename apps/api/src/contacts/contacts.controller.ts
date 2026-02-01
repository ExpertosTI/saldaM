import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() body: any, @Req() req: any) {
        return this.contactsService.create(body, req.user);
    }

    @Get('mine')
    @UseGuards(AuthGuard('jwt'))
    findMine(@Req() req: any) {
        return this.contactsService.findAll(req.user);
    }
}
