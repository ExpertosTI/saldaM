import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';

type JwtUser = { id: string; email: string };
type RequestWithUser = { user: JwtUser };

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    send(
        @Req() req: RequestWithUser,
        @Body() body: { receiverId: string; content: string },
    ) {
        return this.messagesService.send(req.user.id, body.receiverId, body.content);
    }

    @Get('inbox')
    @UseGuards(AuthGuard('jwt'))
    getInbox(@Req() req: RequestWithUser) {
        return this.messagesService.getInbox(req.user.id);
    }

    @Get('unread-count')
    @UseGuards(AuthGuard('jwt'))
    getUnreadCount(@Req() req: RequestWithUser) {
        return this.messagesService.getTotalUnread(req.user.id);
    }

    @Get('conversation/:userId')
    @UseGuards(AuthGuard('jwt'))
    getConversation(
        @Req() req: RequestWithUser,
        @Param('userId') otherUserId: string,
    ) {
        return this.messagesService.getConversation(req.user.id, otherUserId);
    }
}
