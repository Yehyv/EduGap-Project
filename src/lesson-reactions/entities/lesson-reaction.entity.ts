/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('lesson_reactions')
@Unique('UQ_lesson_reaction_user_lesson', ['lesson', 'user']) // 👈 يمنع تكرار الريأكشن لنفس اليوزر على نفس الدرس
export class LessonReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: [0, 1], // 0 = dislike, 1 = like
    comment: '1 like , 0 dislike',
  })
  reaction: number;

  // ========== Relations ==========
  @ManyToOne(() => Lesson, (lesson) => lesson.reactions, {
    onDelete: 'CASCADE',
  })
  lesson: Lesson;

  @ManyToOne(() => User, (user) => user.lessonReactions, {
    onDelete: 'CASCADE',
  })
  user: User;

  // ========== Timestamps ==========
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
