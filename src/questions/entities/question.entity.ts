import { Lesson } from 'src/lessons/entities/lesson.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuestionTranslation } from './question-translation.entity';
import { QuestionAnswer } from './question-answer.entity';

export enum QuestionType {
  MCQ = 0,
  TRUE_FALSE = 1,
}

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'tinyint', width: 1, default: QuestionType.MCQ })
  type: QuestionType;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  is_active: number;

  @ManyToOne(() => Lesson, (lesson) => lesson.questions, {
    onDelete: 'CASCADE',
  })
  lesson: Lesson;

  @OneToMany(() => QuestionTranslation, (translation) => translation.question, {
    cascade: true,
  })
  translations: QuestionTranslation[];

  @OneToMany(() => QuestionAnswer, (answer) => answer.question, {
    cascade: true,
  })
  answers: QuestionAnswer[];
}
