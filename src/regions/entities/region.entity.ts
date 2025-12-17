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
import { RegionTranslation } from './region-translation.entity';
import { City } from 'src/cities/entities/city.entity';
import { Institute } from 'src/institutes/entities/institute.entity';
@Entity()
export class Region {
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

  @ManyToOne(() => City, (city) => city.regions, {
    onDelete: 'CASCADE',
  })
  city: City;
  @OneToMany(() => RegionTranslation, (translations) => translations.region, {
    cascade: true,
  })
  translations: RegionTranslation[];
  @OneToMany(() => Institute, (institutes) => institutes.region)
  institutes: Institute[];
}
