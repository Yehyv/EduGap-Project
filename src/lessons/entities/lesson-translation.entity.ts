import { Language } from 'src/languages/entities/language.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Lesson } from './lesson.entity';
@Entity()
export class LessonTranslation {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  description: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;
  @ManyToOne(() => Lesson, (lesson) => lesson.translations, {
    onDelete: 'CASCADE',
  })
  lesson: Lesson;
}
