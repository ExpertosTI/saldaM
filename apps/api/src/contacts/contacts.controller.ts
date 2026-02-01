import { Controller, Post, Body, Get, Patch, Delete, Param, UseGuards, Req } from '@nestjs/common';
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

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    findOne(@Param('id') id: string, @Req() req: any) {
        return this.contactsService.findOne(id, req.user.id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    update(@Param('id') id: string, @Req() req: any, @Body() body: any) {
        return this.contactsService.update(id, req.user.id, body);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    delete(@Param('id') id: string, @Req() req: any) {
        return this.contactsService.delete(id, req.user.id);
    }
}
