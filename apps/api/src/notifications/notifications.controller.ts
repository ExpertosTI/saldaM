import {
    Controller,
    Get,
    Patch,
    Param,
    UseGuards,
    Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

type JwtUser = { id: string; email: string };
type RequestWithUser = { user: JwtUser };

@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService,
    ) { }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    getAll(@Req() req: RequestWithUser) {
        return this.notificationsService.getForUser(req.user.id);
    }

    @Get('unread-count')
    @UseGuards(AuthGuard('jwt'))
    getUnreadCount(@Req() req: RequestWithUser) {
        return this.notificationsService.getUnreadCount(req.user.id);
    }

    @Patch(':id/read')
    @UseGuards(AuthGuard('jwt'))
    markAsRead(@Param('id') id: string, @Req() req: RequestWithUser) {
        return this.notificationsService.markAsRead(id, req.user.id);
    }

    @Patch('read-all')
    @UseGuards(AuthGuard('jwt'))
    markAllAsRead(@Req() req: RequestWithUser) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }
}
