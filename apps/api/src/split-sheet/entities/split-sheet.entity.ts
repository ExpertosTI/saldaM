import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
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

  @Column({ nullable: true })
  label: string | null; // Sello Disquero

  @Column({ nullable: true })
  studio: string | null; // Nombre del estudio

  @Column({ nullable: true })
  producerName: string | null; // Nombre del productor (if different from collaborators)

  @Column({
    type: 'enum',
    enum: SplitSheetStatus,
    default: SplitSheetStatus.DRAFT,
  })
  status: SplitSheetStatus;

  @Column({ nullable: true })
  s3PdfPath: string | null;

  @Column({ nullable: true })
  s3AuditPath: string | null;

  @Column({ nullable: true })
  finalDocHash: string | null;

  @Column({ nullable: true })
  inviteToken: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.splitSheets)
  owner: User;

  @OneToMany(() => Collaborator, (collaborator) => collaborator.splitSheet, {
    cascade: true,
  })
  collaborators: Collaborator[];
}
