import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SplitSheet } from './split-sheet.entity';
import { User } from '../../user/entities/user.entity';

export enum CollaboratorRole {
    SONGWRITER = 'SONGWRITER',
    PRODUCER = 'PRODUCER',
    PUBLISHER = 'PUBLISHER',
}

@Entity()
export class Collaborator {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column({
        type: 'enum',
        enum: CollaboratorRole,
        default: CollaboratorRole.SONGWRITER,
    })
    role: CollaboratorRole;

    @Column('decimal', { precision: 5, scale: 2 })
    percentage: number;

    @Column({ nullable: true })
    legalName: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    ipi: string; // CAE/IPI Number

    @Column({ nullable: true })
    proAffiliation: string;

    @Column({ nullable: true })
    publishingCompany: string;

    @Column({ default: false })
    hasSigned: boolean;

    @Column({ nullable: true })
    signedAt: Date;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ nullable: true })
    signatureSnapshotPath: string;

    @ManyToOne(() => SplitSheet, (sheet) => sheet.collaborators)
    splitSheet: SplitSheet;

    @ManyToOne(() => User, { nullable: true })
    matchedUser: User;
}
