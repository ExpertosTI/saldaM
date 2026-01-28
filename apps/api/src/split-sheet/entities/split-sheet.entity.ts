import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Collaborator } from './collaborator.entity';

export enum SplitSheetStatus {
    DRAFT = 'DRAFT',
    PENDING_SIGNATURES = 'PENDING_SIGNATURES',
    COMPLETED = 'COMPLETED',
}

@Entity()
export class SplitSheet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({
        type: 'enum',
        enum: SplitSheetStatus,
        default: SplitSheetStatus.DRAFT,
    })
    status: SplitSheetStatus;

    @Column({ nullable: true })
    s3PdfPath: string;

    @Column({ nullable: true })
    s3AuditPath: string;

    @Column({ nullable: true })
    finalDocHash: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.splitSheets)
    owner: User;

    @OneToMany(() => Collaborator, (collaborator) => collaborator.splitSheet, { cascade: true })
    collaborators: Collaborator[];
}
