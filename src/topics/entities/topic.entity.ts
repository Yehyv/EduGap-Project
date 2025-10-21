import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  Column,
} from 'typeorm';
import { Content } from 'src/contents/entities/content.entity';
import { TopicTranslation } from './topic-translation.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
@Entity()
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id', type: 'int' })
  order_id: number;

  @Column({ name: 'is_active', type: 'enum', enum: [0, 1], default: 1 })
  is_active: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Content, (content) => content.topics, {
    onDelete: 'CASCADE',
  })
  content: Content;
  @OneToMany(() => TopicTranslation, (translation) => translation.topic, {
    cascade: true,
  })
  translations: TopicTranslation[];

  @OneToMany(() => Lesson, (lesson) => lesson.topic)
  lessons: Lesson[];
}
