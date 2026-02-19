import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SplitSheet } from './split-sheet.entity';
import { User } from '../../user/entities/user.entity';

export enum CollaboratorRole {
  SONGWRITER = 'SONGWRITER',
  PRODUCER = 'PRODUCER',
  PUBLISHER = 'PUBLISHER',
  MASTER_OWNER = 'MASTER_OWNER',
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
  legalName: string | null;

  @Column({ nullable: true })
  phone: string | null;

  @Column({ nullable: true })
  address: string | null;

  @Column({ nullable: true })
  ipi: string | null; // CAE/IPI Number

  @Column({ nullable: true })
  proAffiliation: string | null;

  @Column({ nullable: true })
  publishingCompany: string | null;

  @Column({ default: false })
  hasSigned: boolean;

  @Column({ nullable: true })
  signedAt: Date | null;

  @Column({ nullable: true })
  ipAddress: string | null;

  @Column({ nullable: true })
  userAgent: string | null;

  @Column({ nullable: true })
  signatureHash: string | null; // Cryptographic hash of the agreement state at signing

  @Column({ default: false })
  otpVerified: boolean; // Was 2FA used?

  @Column({ nullable: true })
  signatureSnapshotPath: string | null;

  @Column({ nullable: true })
  identityDocPath: string | null; // Path to uploaded ID document (cédula/passport)

  @Column({ nullable: true })
  otpVerifiedAt: Date | null; // When email OTP was verified before signing

  @ManyToOne(() => SplitSheet, (sheet) => sheet.collaborators, {
    onDelete: 'CASCADE',
  })
  splitSheet: SplitSheet;

  @ManyToOne(() => User, { nullable: true })
  matchedUser: User | null;
}
