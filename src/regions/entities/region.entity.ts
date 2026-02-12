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
import { RegionTranslation } from './region-translation.entity';
import { City } from 'src/cities/entities/city.entity';
import { Institute } from 'src/institutes/entities/institute.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
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

  @ManyToOne(() => SystemUser, (sysUser) => sysUser.institutes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: SystemUser;
}
