import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PlanUpgradeRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('plan_upgrade_requests')
export class PlanUpgradeRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'institute_id', type: 'int' })
  instituteId: number;

  @Column({ name: 'current_contract_id', type: 'int' })
  currentContractId: number;

  @Column({ name: 'current_plan_id', type: 'int' })
  currentPlanId: number;

  @Column({ name: 'requested_plan_id', type: 'int' })
  requestedPlanId: number;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({
    name: 'additional_students_needed',
    type: 'int',
    nullable: true,
  })
  additionalStudentsNeeded: number | null;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({
    type: 'enum',
    enum: PlanUpgradeRequestStatus,
    default: PlanUpgradeRequestStatus.PENDING,
  })
  status: PlanUpgradeRequestStatus;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes: string | null;

  @Column({ name: 'reviewed_by', type: 'int', nullable: true })
  reviewedBy: number | null;

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
