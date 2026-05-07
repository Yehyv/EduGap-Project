import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Institute } from 'src/institutes/entities/institute.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { SubscriptionPlan } from 'src/subscription-plans/entities/subscription-plan.entity';
import { ContractInstallment } from 'src/contract-installments/entities/contract-installment.entity';
import { ContractPayment } from 'src/contract-payments/entities/contract-payment.entity';

export enum DiscountType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

@Entity('institute_annual_contracts')
@Index(['institute', 'academic_year'])
export class InstituteAnnualContract {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Institute, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'institute_id' })
  institute: Institute;

  @ManyToOne(() => SubscriptionPlan, (plan) => plan.contracts, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;

  @Column({ name: 'academic_year', type: 'int' })
  academic_year: number;

  @Column({ name: 'max_students_allowed', type: 'int' })
  max_students_allowed: number;

  @Column({
    name: 'price_per_student',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price_per_student: number;

  @Column({ name: 'package_amount', type: 'decimal', precision: 12, scale: 2 })
  package_amount: number;

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: DiscountType,
    default: DiscountType.FIXED,
  })
  discount_type: DiscountType;

  @Column({
    name: 'discount_value',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  discount_value: number;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  discount_amount: number;

  @Column({
    name: 'amount_after_discount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  amount_after_discount: number;

  @Column({
    name: 'administrative_fees',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  administrative_fees: number;

  @Column({
    name: 'tax_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  tax_percentage: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  tax_amount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  total_amount: number;

  @Column({ name: 'installments_count', type: 'int', default: 4 })
  installments_count: number;

  @Column({
    name: 'payment_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  payment_percentage: number;

  @Column({ name: 'contract_start_date', type: 'date', nullable: true })
  contract_start_date: string | null;

  @Column({ name: 'contract_end_date', type: 'date', nullable: true })
  contract_end_date: string | null;

  @Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.DRAFT })
  status: ContractStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToOne(() => SystemUser, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy: SystemUser | null;

  @OneToMany(() => ContractInstallment, (installment) => installment.contract)
  installments: ContractInstallment[];

  @OneToMany(() => ContractPayment, (payment) => payment.contract)
  payments: ContractPayment[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date | null;
}
