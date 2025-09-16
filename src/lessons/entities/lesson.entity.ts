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
import { LessonTranslation } from './lesson-translation.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
@Entity()
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  imageUrl: string;
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
  @OneToMany(() => LessonProgress, (progress) => progress.lesson)
  progresses: LessonProgress[];
}
