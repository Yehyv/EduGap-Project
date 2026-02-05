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
import { Institute } from 'src/institutes/entities/institute.entity';
import { SystemRole } from 'src/system-roles/entities/system-role.entity';
import { ActivationLog } from 'src/users/entities/activation-log.entity';
@Entity('system_users')
export class SystemUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  full_name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 14, unique: true })
  national_id: string;

  @Column({ type: 'varchar', length: 3 })
  phone_key: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    default:
      'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg',
  })
  user_image: string | null;

  @Column({ type: 'varchar', length: 30, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  refresh_token: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  is_active: number;

  @ManyToOne(() => SystemRole, (role) => role.users, { onDelete: 'CASCADE' })
  SysUserrole: SystemRole;


  @ManyToOne(() => Institute, (institute) => institute.systemUsers, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  institute: Institute | null;

  @OneToMany(() => ActivationLog, (activationLog) => activationLog.systemUser)
  activationLogs: ActivationLog[];
}
