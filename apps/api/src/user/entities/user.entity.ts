import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { SplitSheet } from '../../split-sheet/entities/split-sheet.entity';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MASTER = 'MASTER',
}

export enum UserType {
  ARTIST = 'ARTIST',
  PRODUCER = 'PRODUCER',
  PUBLISHER = 'PUBLISHER',
}

export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserType,
    nullable: true,
  })
  userType: UserType | null;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.PENDING,
  })
  kycStatus: KycStatus;

  @Exclude()
  @Column({ nullable: true })
  kycDocumentPath: string | null;

  @Exclude()
  @Column({ nullable: true })
  kycVideoPath: string | null;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ nullable: true })
  passwordHash: string | null;

  @Column({ nullable: true })
  avatarUrl: string | null;

  @Column({ nullable: true })
  bio: string | null;

  @Column({ nullable: true })
  phone: string | null;

  @Column({ nullable: true })
  firstName: string | null;

  @Column({ nullable: true })
  lastName: string | null;

  @Column({ nullable: true })
  ipiNumber: string | null;

  @Column({ nullable: true })
  proAffiliation: string | null; // e.g. ASCAP, BMI, SESAC

  @Column({ nullable: true })
  publishingCompany: string | null;

  @Exclude()
  @Column({ nullable: true })
  signatureEncryptedPath: string | null;

  @Exclude()
  @Column({ nullable: true })
  encryptionKeyId: string | null;

  // New fields for Signature Module 2.0
  @Column({ nullable: true, type: 'text' })
  signatureUrl: string | null; // Base64 or URL of the signature image

  @Column({ default: false })
  hasRegisteredSignature: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => SplitSheet, (sheet) => sheet.owner)
  splitSheets: SplitSheet[];
}
