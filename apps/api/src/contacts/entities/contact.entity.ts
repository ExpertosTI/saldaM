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

@Entity()
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  ipiNumber: string;

  @Column({ type: 'varchar', nullable: true })
  pro: string; // Performing Rights Organization

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

  @ManyToOne(() => User)
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
