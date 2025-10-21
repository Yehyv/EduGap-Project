/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { User } from 'src/users/entities/user.entity';
import { Content } from 'src/contents/entities/content.entity';

@Entity('lesson_notes')
export class LessonNote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  notes: string;

  // ========== Relations ==========
  @ManyToOne(() => Lesson, (lesson) => lesson.notes, { onDelete: 'CASCADE' })
  lesson: Lesson;

  @ManyToOne(() => User, (user) => user.lessonNotes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Content, (content) => content.lessonNotes, {
    onDelete: 'CASCADE',
  })
  content: Content;

  // ========== Timestamps ==========
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;
}
