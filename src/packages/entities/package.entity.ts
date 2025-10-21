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
import { PackageTranslation } from './package-translation.entity';
@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  image: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;

  @Column({ type: 'enum', enum: [0, 1], default: 1 })
  is_active: number;

  @Column({ type: 'int', name: 'created_by', nullable: true })
  created_by: number; // FK(27) SystemUser

  // Relations
  @OneToMany(() => PackageTranslation, (translation) => translation.package, {
    cascade: true,
  })
  translations: PackageTranslation[];
}
