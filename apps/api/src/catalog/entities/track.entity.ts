import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Catalog } from './catalog.entity';

@Entity()
export class Track {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  isrc: string;

  @Column({ nullable: true })
  duration: string; // e.g., '3:45'

  @ManyToOne(() => Catalog, (catalog) => catalog.tracks)
  catalog: Catalog;

  @CreateDateColumn()
  createdAt: Date;
}
