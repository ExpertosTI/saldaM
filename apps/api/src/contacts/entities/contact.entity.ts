import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum ContactRole {
  SONGWRITER = 'SONGWRITER',
  PRODUCER = 'PRODUCER',
  PUBLISHER = 'PUBLISHER',
  ARTIST = 'ARTIST',
  OTHER = 'OTHER',
}

export enum ContactStatus {
  PENDING = 'PENDING',           // Added by email/phone, person not on platform yet
  REQUEST_SENT = 'REQUEST_SENT', // Person exists on platform, awaiting their acceptance
  CONNECTED = 'CONNECTED',       // Both parties accepted
  BLOCKED = 'BLOCKED',
}

@Entity()
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  ipiNumber: string;

  @Column({ type: 'varchar', nullable: true })
  pro: string;

  @Column({ type: 'varchar', nullable: true })
  publishingCompany: string;

  @Column({
    type: 'enum',
    enum: ContactRole,
    default: ContactRole.SONGWRITER,
  })
  role: ContactRole;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  isFavorite: boolean;

  // --- Social linking fields ---

  @Column({ type: 'uuid', nullable: true })
  linkedUserId: string | null;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: ContactStatus;

  @Column({ type: 'timestamp', nullable: true })
  linkedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  linkedUserAvatar: string | null;

  // --- Relations ---

  @ManyToOne(() => User)
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
