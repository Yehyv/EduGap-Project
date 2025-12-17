import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Country } from './country.entity';
import { Language } from 'src/languages/entities/language.entity';
@Unique(['country', 'language'])
@Entity('country_translations')
export class CountryTranslation {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 255 })
  name: string;
  @ManyToOne(() => Country, (country) => country.translations, {
    onDelete: 'CASCADE',
  })
  country: Country;
  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;
}
