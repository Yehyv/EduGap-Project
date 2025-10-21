/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { CountryTranslation } from './country-translation.entity';
@Entity('countries')
export class Country {
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

  @OneToMany(() => CountryTranslation, (translation) => translation.country, {
    cascade: true,
  })
  translations: CountryTranslation[];
}
