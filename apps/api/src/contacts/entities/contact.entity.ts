import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Contact {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    ipiNumber: string;

    @Column({ nullable: true })
    pro: string; // Performing Rights Organization

    @ManyToOne(() => User, (user) => user.id)
    owner: User;

    @CreateDateColumn()
    createdAt: Date;
}
