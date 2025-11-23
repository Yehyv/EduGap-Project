import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { Question } from './question.entity';
import { QuestionAnswerTranslation } from './question-answer-translation.entity';
export enum QuestionAnswerLabel {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

@Entity()
@Unique(['question', 'label'])
export class QuestionAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: QuestionAnswerLabel })
  label: QuestionAnswerLabel; // A / B / C / D

  @Column({ name: 'is_correct', type: 'tinyint', width: 1, default: 0 })
  is_correct: number;

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  question: Question;

  @OneToMany(
    () => QuestionAnswerTranslation,
    (translation) => translation.answer,
    { cascade: true },
  )
  translations: QuestionAnswerTranslation[];
}
