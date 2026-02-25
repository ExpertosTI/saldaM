import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Track } from './track.entity';

@Entity()
export class Catalog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  genre: string;

  @Column({ type: 'varchar', nullable: true })
  labelName: string;

  @Column({ nullable: true })
  type: string; // Album, EP, Single

  @Column({ type: 'date', nullable: true })
  releaseDate: Date;

  @Column({ nullable: true })
  upc: string;

  @Column({ nullable: true })
  artworkUrl: string;

  @ManyToOne(() => User, (user) => user.id)
  owner: User;

  @OneToMany(() => Track, (track) => track.catalog)
  tracks: Track[];

  @CreateDateColumn()
  createdAt: Date;
}
