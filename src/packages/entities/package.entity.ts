/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PackageTranslation } from './package-translation.entity';
import { SavedPackage } from 'src/saved-packages/entities/saved-package.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
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
  deleted_at: Date | null;

  @Column({ type: 'enum', enum: [0, 1], default: 1 })
  is_active: number;

  @Column({ type: 'int', name: 'created_by', nullable: true })
  created_by: number; // FK(27) SystemUser

  // Relations
  @OneToMany(() => PackageTranslation, (translation) => translation.package, {
    cascade: true,
  })
  translations: PackageTranslation[];

  @OneToMany(() => SavedPackage, (saved) => saved.package)
  savedByUsers: SavedPackage[];

  @ManyToOne(() => SystemUser, (sysUser) => sysUser.institutes, {
      nullable: true,
      onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'created_by' })
    createdBy: SystemUser;
}
