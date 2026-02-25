import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    senderId: string;

    @Column({ type: 'uuid' })
    receiverId: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ default: false })
    isRead: boolean;

    @ManyToOne(() => User)
    sender: User;

    @ManyToOne(() => User)
    receiver: User;

    @CreateDateColumn()
    createdAt: Date;
}
