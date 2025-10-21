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
import { SystemUser } from './system-user.entity';
@Entity('system_roles')
export class SystemRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  role_title: string;

  @Column({ type: 'enum', enum: [0, 1], comment: '0 portal - 1 dashboard' })
  role_category: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @Column({ type: 'enum', enum: [0, 1], default: 1 })
  is_active: number;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @OneToMany(() => SystemUser, (users) => users.role)
  users: SystemUser[];

}
