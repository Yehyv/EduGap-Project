import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('user_otps')
export class UserOtp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 6 }) // OTP code من 6 أرقام
  code: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date; // انتهاء الصلاحية

  @Column({ type: 'boolean', default: false })
  isUsed: boolean; // لو اتأكد خلاص

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.otps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
