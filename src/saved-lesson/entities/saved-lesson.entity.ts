/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { User } from 'src/users/entities/user.entity';
import { Content } from 'src/contents/entities/content.entity';

@Entity('lesson_saved')
@Unique(['lesson', 'user', 'content']) // عشان ميعملش duplication
export class SavedLesson {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Lesson, (lesson) => lesson.savedByUsers, {
    onDelete: 'CASCADE',
  })
  lesson: Lesson;

  @ManyToOne(() => User, (user) => user.savedLessons, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Content, (content) => content.savedLessons, {
    onDelete: 'CASCADE',
  })
  content: Content;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;
}
