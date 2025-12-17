import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { City } from './city.entity';
import { Language } from 'src/languages/entities/language.entity';

@Entity()
export class CityTranslation {
  @PrimaryGeneratedColumn()
  id: number;
  @Column('varchar', { length: 255 })
  name: string;
  @ManyToOne(() => City, (city) => city.translations, {
    onDelete: 'CASCADE',
  })
  city: City;
  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;
}
