import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';

@Entity()
export class ActivationLog {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 100 })
  reason: string;
  @Column({ type: 'tinyint', width: 1, default: 1 })
  action: boolean;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  @ManyToOne(() => User, (user) => user.activationLogs, { nullable: false })
  user: User;
  @ManyToOne(() => SystemUser, (systemUser) => systemUser.activationLogs, {
    nullable: false,
  })
  systemUser: SystemUser;
}
