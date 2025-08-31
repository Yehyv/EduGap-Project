import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Content } from 'src/contents/entities/content.entity';
import { TopicTranslation } from './topic-translation.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
@Entity()
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
  @ManyToOne(() => Content, (content) => content.topics, {
    onDelete: 'CASCADE',
  })
  content: Content;
  @OneToMany(() => TopicTranslation, (translation) => translation.topic, {
    cascade: true,
  })
  translations: TopicTranslation[];
  @OneToMany(() => Lesson, (lesson) => lesson.topic, {
    cascade: true,
  })
  lessons: Lesson;
}
