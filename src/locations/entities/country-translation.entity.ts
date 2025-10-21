/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Country } from './country.entity';
import { Language } from 'src/languages/entities/language.entity';

@Entity('countries_translations')
export class CountryTranslation {
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

  @ManyToOne(() => Country, (country) => country.translations, {
    onDelete: 'CASCADE',
  })
  country: Country;
}
