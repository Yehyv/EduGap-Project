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
import { LessonMaterial } from './lesson-material.entity';
import { Language } from 'src/languages/entities/language.entity';

@Entity('lesson_materials_translations')
export class LessonMaterialTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // ================= RELATIONS =================

  @ManyToOne(() => Language, { onDelete: 'CASCADE' })
  language: Language;

  @ManyToOne(() => LessonMaterial, (material) => material.translations, {
    onDelete: 'CASCADE',
  })
  lessonMaterial: LessonMaterial;

  // ================= TIMESTAMPS =================
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
