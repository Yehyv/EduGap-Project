import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export type PasswordActionType =
  | 'CHANGE_WITH_OLD'
  | 'RESET_WITH_OTP'
  | 'ADMIN_FORCE_CHANGE';

@Entity('password_actions')
export class PasswordAction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.passwordActions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // نوع العملية
  @Column({ type: 'varchar', length: 50 })
  action: PasswordActionType;

  //   // مين اللي عملها (اختياري)
  //   @Column({ type: 'varchar', length: 50, nullable: true })
  //   performedBy?: 'USER' | 'ADMIN' | 'SYSTEM';

  //   // IP / User-Agent لو حابب تستعملهم بعدين
  //   @Column({ type: 'varchar', length: 255, nullable: true })
  //   ip?: string;

  //   @Column({ type: 'varchar', length: 255, nullable: true })
  //   userAgent?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
