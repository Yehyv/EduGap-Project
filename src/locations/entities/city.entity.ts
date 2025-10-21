/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Country } from './country.entity';
import { CityTranslation } from './city-translation.entity';
@Entity('cities')
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;

  @Column({ type: 'enum', enum: [0, 1], default: 1 })
  is_active: number;

  @ManyToOne(() => Country, { onDelete: 'CASCADE' })
  country: Country;

  @OneToMany(() => CityTranslation, (translation) => translation.city, {
    cascade: true,
  })
  translations: CityTranslation[];
}