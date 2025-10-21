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

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;
  @ManyToOne(() => Lesson, (lesson) => lesson.translations, {
    onDelete: 'CASCADE',
  })
  lesson: Lesson;
}
