import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { SplitSheet } from '../../split-sheet/entities/split-sheet.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => SplitSheet, (sheet) => sheet.owner)
  splitSheets: SplitSheet[];
}
