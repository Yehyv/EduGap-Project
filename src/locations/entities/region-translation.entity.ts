/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Region } from './region.entity';
import { Language } from 'src/languages/entities/language.entity';

@Entity('regions_translations')
export class RegionTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Language, { onDelete: 'CASCADE' })
  language: Language;

  @ManyToOne(() => Region, (region) => region.translations, {
    onDelete: 'CASCADE',
  })
  region: Region;
}
