import { Language } from 'src/languages/entities/language.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Question } from './question.entity';

@Entity()
@Unique(['question', 'language'])
export class QuestionTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;

  @ManyToOne(() => Question, (question) => question.translations, {
    onDelete: 'CASCADE',
  })
  question: Question;
}
