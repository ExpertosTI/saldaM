import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContactsService } from './contacts.service';
import { ContactRole } from './entities/contact.entity';

type JwtUser = { id: string; email: string };
type RequestWithUser = { user: JwtUser };

type ContactBody = {
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

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() body: ContactBody, @Req() req: RequestWithUser) {
    return this.contactsService.create(body, req.user);
  }

  @Get('mine')
  @UseGuards(AuthGuard('jwt'))
  findMine(
    @Req() req: RequestWithUser,
    @Query('search') search?: string,
    @Query('role') role?: ContactRole,
    @Query('favorite') favorite?: string,
  ) {
    return this.contactsService.findAll(req.user, {
      search,
      role,
      favorite:
        favorite === 'true' ? true : favorite === 'false' ? false : undefined,
    });
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  getStats(@Req() req: RequestWithUser) {
    return this.contactsService.getStats(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.contactsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() body: Partial<ContactBody>,
  ) {
    return this.contactsService.update(id, req.user.id, body);
  }

  @Patch(':id/favorite')
  @UseGuards(AuthGuard('jwt'))
  toggleFavorite(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.contactsService.toggleFavorite(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.contactsService.delete(id, req.user.id);
  }
}
