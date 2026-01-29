import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
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

  @Column({ nullable: true })
  kycDocumentPath: string;

  @Column({ nullable: true })
  kycVideoPath: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

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

  @Column({ nullable: true })
  signatureEncryptedPath: string;

  @Column({ nullable: true })
  encryptionKeyId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => SplitSheet, (sheet) => sheet.owner)
  splitSheets: SplitSheet[];
}
