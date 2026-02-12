import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CountryTranslation } from './country-translation.entity';
import { City } from 'src/cities/entities/city.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
@Entity()
export class Country {
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
  @OneToMany(() => CountryTranslation, (translations) => translations.country, {
    cascade: true,
  })
  translations: CountryTranslation[];
  @OneToMany(() => City, (city) => city.country, {
    cascade: true,
  })
  cities: City[];

  @ManyToOne(() => SystemUser, (sysUser) => sysUser.institutes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: SystemUser;
}
