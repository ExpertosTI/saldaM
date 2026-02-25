import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    Notification,
    NotificationType,
} from './entities/notification.entity';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectRepository(Notification)
        private notificationRepo: Repository<Notification>,
    ) { }

    async create(params: {
        recipientId: string;
        type: NotificationType;
        title: string;
        message: string;
        actionUrl?: string;
        fromUserId?: string;
        fromUserName?: string;
        fromUserAvatar?: string;
    }) {
        const notification = this.notificationRepo.create({
            recipient: { id: params.recipientId },
            type: params.type,
            title: params.title,
            message: params.message,
            actionUrl: params.actionUrl || null,
            fromUserId: params.fromUserId || null,
            fromUserName: params.fromUserName || null,
            fromUserAvatar: params.fromUserAvatar || null,
        });
        return this.notificationRepo.save(notification);
    }

    async getForUser(userId: string) {
        return this.notificationRepo.find({
            where: { recipient: { id: userId } },
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }

    async getUnreadCount(userId: string) {
        return this.notificationRepo.count({
            where: { recipient: { id: userId }, isRead: false },
        });
    }

    async markAsRead(id: string, userId: string) {
        await this.notificationRepo.update(
            { id, recipient: { id: userId } },
            { isRead: true },
        );
        return { success: true };
    }

    async markAllAsRead(userId: string) {
        await this.notificationRepo.update(
            { recipient: { id: userId }, isRead: false },
            { isRead: true },
        );
        return { success: true };
    }
}
