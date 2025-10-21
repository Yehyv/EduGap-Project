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
import { City } from './city.entity';
import { RegionTranslation } from './region-translation.entity';
import { Institute } from 'src/institutes/entities/institute.entity';
@Entity('regions')
export class Region {
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

  @ManyToOne(() => City, { onDelete: 'CASCADE' })
  city: City;

  @OneToMany(() => RegionTranslation, (translation) => translation.region, {
    cascade: true,
  })
  translations: RegionTranslation[];

  @OneToMany(() => Institute, (institute) => institute.region)
  institute: Institute[];
}
