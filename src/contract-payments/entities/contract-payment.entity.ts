import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContractInstallment } from 'src/contract-installments/entities/contract-installment.entity';
import { InstituteAnnualContract } from 'src/institute-annual-contracts/entities/institute-annual-contract.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
  CHEQUE = 'CHEQUE',
  ONLINE = 'ONLINE',
}

export enum PaymentStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

@Entity('contract_payments')
export class ContractPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => InstituteAnnualContract, (contract) => contract.payments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contract_id' })
  contract: InstituteAnnualContract;

  @ManyToOne(() => ContractInstallment, (installment) => installment.payments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'installment_id' })
  installment: ContractInstallment | null;

  @Column({ name: 'payment_date', type: 'date' })
  payment_date: string;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 12, scale: 2 })
  paid_amount: number;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
  })
  payment_method: PaymentMethod;

  @Column({ name: 'receipt_no', type: 'varchar', length: 100, nullable: true })
  receipt_no: string | null;

  @Column({
    name: 'receipt_file',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  receipt_file: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.CONFIRMED,
  })
  status: PaymentStatus;

  @Column({ name: 'cancel_reason', type: 'text', nullable: true })
  cancel_reason: string | null;

  @ManyToOne(() => SystemUser, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy: SystemUser | null;

  @ManyToOne(() => SystemUser, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cancelled_by' })
  cancelledBy: SystemUser | null;

  @Column({ name: 'cancelled_at', type: 'datetime', nullable: true })
  cancelled_at: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
