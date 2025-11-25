import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
export type OtpPurpose = 'FIRST_LOGIN' | 'RESET_PASSWORD' | 'CHANGE_PHONE';

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

  @Index('IDX_user_otps_challengeId', ['challengeId'], { unique: true })
  @Column({ type: 'varchar', length: 36, nullable: false })
  challengeId: string; // بدون default في الـDBا

  @Column({ type: 'varchar', length: 20, nullable: true })
  purpose: OtpPurpose | null;

  targetPhone?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.otps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
