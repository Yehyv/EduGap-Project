import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Topic } from './topic.entity';
import { Language } from 'src/languages/entities/language.entity';
@Entity()
export class TopicTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;

  @ManyToOne(() => Topic, (topic) => topic.translations, {
    onDelete: 'CASCADE',
  })
  topic: Topic;

  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;
}
