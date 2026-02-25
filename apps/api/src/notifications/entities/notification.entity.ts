import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum NotificationType {
    CONNECTION_REQUEST = 'CONNECTION_REQUEST',
    CONNECTION_ACCEPTED = 'CONNECTION_ACCEPTED',
    INVITE_SENT = 'INVITE_SENT',
    SPLIT_SHEET_INVITE = 'SPLIT_SHEET_INVITE',
    SYSTEM = 'SYSTEM',
}

@Entity()
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    recipient: User;

    @Column({ type: 'varchar' })
    type: NotificationType;

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'varchar', nullable: true })
    actionUrl: string | null;

    @Column({ type: 'uuid', nullable: true })
    fromUserId: string | null;

    @Column({ type: 'varchar', nullable: true })
    fromUserName: string | null;

    @Column({ type: 'varchar', nullable: true })
    fromUserAvatar: string | null;

    @Column({ default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
