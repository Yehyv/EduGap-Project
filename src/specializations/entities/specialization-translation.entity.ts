/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Specialization } from './specialization.entity';
import { Language } from 'src/languages/entities/language.entity';

@Entity('specializations_translations')
export class SpecializationTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  title: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => Language, { onDelete: 'CASCADE' })
  language: Language;

  @ManyToOne(
    () => Specialization,
    (specialization) => specialization.translations,
    { onDelete: 'CASCADE' },
  )
  specialization: Specialization;
}
