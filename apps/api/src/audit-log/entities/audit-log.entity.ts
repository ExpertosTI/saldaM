import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    action: string; // e.g., 'LOGIN', 'SIGN_SPLIT_SHEET', 'CREATE_ALBUM'

    @Column({ type: 'text', nullable: true })
    details: string; // JSON or description

    @Column({ nullable: true })
    ipAddress: string;

    @ManyToOne(() => User, { nullable: true })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}
