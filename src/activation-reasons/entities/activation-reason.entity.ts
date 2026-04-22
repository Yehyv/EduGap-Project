import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActivationLog } from 'src/users/entities/activation-log.entity';
import { ActivationReasonTranslation } from './activation-reason-translation.entity';

export enum ActivationReasonType {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('activation_reasons')
export class ActivationReason {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ActivationReasonType,
  })
  type: ActivationReasonType;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  is_active: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;

  @OneToMany(() => ActivationReasonTranslation, (tr) => tr.activationReason, {
    cascade: true,
  })
  translations: ActivationReasonTranslation[];

  @OneToMany(
    () => ActivationLog,
    (activationLog) => activationLog.activationReason,
  )
  activationLogs: ActivationLog[];
}
