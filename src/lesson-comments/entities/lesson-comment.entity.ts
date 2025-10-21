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

@Entity('lesson_comments')
export class LessonComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // ================= RELATIONS =================
  @ManyToOne(() => Lesson, (lesson) => lesson.comments, { onDelete: 'CASCADE' })
  lesson: Lesson;

  @ManyToOne(() => User, (user) => user.lessonComments, { onDelete: 'CASCADE' })
  user: User;
}
