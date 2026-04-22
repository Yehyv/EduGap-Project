import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { ActivationReason } from 'src/activation-reasons/entities/activation-reason.entity';

@Entity()
export class ActivationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  reason: string;

  @ManyToOne(
    () => ActivationReason,
    (activationReason) => activationReason.activationLogs,
    { nullable: false },
  )
  @JoinColumn({ name: 'reason_id' })
  activationReason: ActivationReason;

  @Column({ type: 'tinyint', width: 1, default: 1 })
  action: boolean;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.activationLogs, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => SystemUser, (systemUser) => systemUser.activationLogs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'system_user_id' })
  systemUser: SystemUser | null;
}
