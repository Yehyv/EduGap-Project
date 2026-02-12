import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Country } from 'src/countries/entities/country.entity';
import { CityTranslation } from './city-translation.entity';
import { Region } from 'src/regions/entities/region.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
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
  @ManyToOne(() => SystemUser, (sysUser) => sysUser.institutes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: SystemUser;
}
