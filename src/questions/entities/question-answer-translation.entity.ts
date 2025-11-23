import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Language } from 'src/languages/entities/language.entity';
import { QuestionAnswer } from './question-answer.entity';

@Entity()
@Unique(['answer', 'language'])
export class QuestionAnswerTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string; // نص الإجابة في اللغة دي

  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;

  @ManyToOne(() => QuestionAnswer, (answer) => answer.translations, {
    onDelete: 'CASCADE',
  })
  answer: QuestionAnswer;
}
