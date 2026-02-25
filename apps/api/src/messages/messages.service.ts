import {
    Injectable,
    Logger,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Contact, ContactStatus } from '../contacts/entities/contact.entity';

@Injectable()
export class MessagesService {
    private readonly logger = new Logger(MessagesService.name);

    constructor(
        @InjectRepository(Message)
        private messageRepo: Repository<Message>,
        @InjectRepository(Contact)
        private contactRepo: Repository<Contact>,
    ) { }

    /**
     * Send a message. Only allowed between CONNECTED contacts.
     */
    async send(senderId: string, receiverId: string, content: string) {
        // Verify they are connected
        const connection = await this.contactRepo.findOne({
            where: [
                { owner: { id: senderId }, linkedUserId: receiverId, status: ContactStatus.CONNECTED },
                { owner: { id: receiverId }, linkedUserId: senderId, status: ContactStatus.CONNECTED },
            ],
        });

        if (!connection) {
            throw new ForbiddenException('Solo puedes enviar mensajes a contactos conectados.');
        }

        const message = this.messageRepo.create({
            senderId,
            receiverId,
            content,
        });
        return this.messageRepo.save(message);
    }

    /**
     * Get conversation between two users
     */
    async getConversation(userId: string, otherUserId: string, limit = 50) {
        const messages = await this.messageRepo.find({
            where: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId },
            ],
            order: { createdAt: 'ASC' },
            take: limit,
        });

        // Mark received messages as read
        const unreadIds = messages
            .filter((m) => m.receiverId === userId && !m.isRead)
            .map((m) => m.id);
        if (unreadIds.length > 0) {
            await this.messageRepo.update(unreadIds, { isRead: true });
        }

        return messages;
    }

    /**
     * Get inbox: list of conversations with last message
     */
    async getInbox(userId: string) {
        const messages = await this.messageRepo
            .createQueryBuilder('m')
            .where('m.senderId = :userId OR m.receiverId = :userId', { userId })
            .orderBy('m.createdAt', 'DESC')
            .getMany();

        // Group by conversation partner
        const conversations = new Map<
            string,
            { partnerId: string; lastMessage: Message; unreadCount: number }
        >();

        for (const msg of messages) {
            const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            if (!conversations.has(partnerId)) {
                conversations.set(partnerId, {
                    partnerId,
                    lastMessage: msg,
                    unreadCount: 0,
                });
            }
            if (msg.receiverId === userId && !msg.isRead) {
                const conv = conversations.get(partnerId)!;
                conv.unreadCount++;
            }
        }

        return Array.from(conversations.values());
    }

    async getTotalUnread(userId: string) {
        return this.messageRepo.count({
            where: { receiverId: userId, isRead: false },
        });
    }
}
