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
import { Package } from './package.entity';
import { Language } from 'src/languages/entities/language.entity';

@Entity('package_translations')
export class PackageTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  learning_outcoms: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;

  // Relations
  @ManyToOne(() => Package, (pkg) => pkg.translations, {
    onDelete: 'CASCADE',
  })
  package: Package;

  @ManyToOne(() => Language, { onDelete: 'CASCADE' })
  language: Language;
}
