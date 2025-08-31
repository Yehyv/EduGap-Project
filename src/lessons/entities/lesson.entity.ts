import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { LessonTranslation } from './lesson-translation.entity';
import { Topic } from 'src/topics/entities/topic.entity';
@Entity()
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
  @OneToMany(() => LessonTranslation, (translation) => translation.lesson, {
    cascade: true,
  })
  translations: LessonTranslation[];
  @ManyToOne(() => Topic, (topic) => topic.lessons, {
    onDelete: 'CASCADE',
  })
  topic: Topic;
}
