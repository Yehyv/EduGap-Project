/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { City } from './city.entity';
import { Language } from 'src/languages/entities/language.entity';

@Entity('cities_translations')
export class CityTranslation {
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

  @ManyToOne(() => City, (city) => city.translations, {
    onDelete: 'CASCADE',
  })
  city: City;
}
