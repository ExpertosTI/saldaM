import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
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
  userType: UserType;

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
  kycDocumentPath: string;

  @Exclude()
  @Column({ nullable: true })
  kycVideoPath: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  ipiNumber: string;

  @Column({ nullable: true })
  proAffiliation: string; // e.g. ASCAP, BMI, SESAC

  @Column({ nullable: true })
  publishingCompany: string;

  @Exclude()
  @Column({ nullable: true })
  signatureEncryptedPath: string;

  @Exclude()
  @Column({ nullable: true })
  encryptionKeyId: string;

  // New fields for Signature Module 2.0
  @Column({ nullable: true, type: 'text' })
  signatureUrl: string; // Base64 or URL of the signature image

  @Column({ default: false })
  hasRegisteredSignature: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => SplitSheet, (sheet) => sheet.owner)
  splitSheets: SplitSheet[];
}
