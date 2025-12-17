import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Country } from 'src/countries/entities/country.entity';
import { CityTranslation } from './city-translation.entity';
import { Region } from 'src/regions/entities/region.entity';
@Entity()
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'tinyint', default: 1 })
  isActive: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Country, (country) => country.cities, {
    onDelete: 'CASCADE',
  })
  country: Country;
  @OneToMany(() => CityTranslation, (translations) => translations.city, {
    cascade: true,
  })
  translations: CityTranslation[];
  @OneToMany(() => Region, (region) => region.city, {
    cascade: true,
  })
  regions: Region[];
}
