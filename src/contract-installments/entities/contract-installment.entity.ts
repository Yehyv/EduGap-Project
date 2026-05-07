import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InstituteAnnualContract } from 'src/institute-annual-contracts/entities/institute-annual-contract.entity';
import { ContractPayment } from 'src/contract-payments/entities/contract-payment.entity';

export enum InstallmentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

@Entity('contract_installments')
@Index(['contract', 'installment_no'], { unique: true })
export class ContractInstallment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => InstituteAnnualContract,
    (contract) => contract.installments,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'contract_id' })
  contract: InstituteAnnualContract;

  @Column({ name: 'installment_no', type: 'int' })
  installment_no: number;

  @Column({ name: 'due_date', type: 'date' })
  due_date: string;

  @Column({
    name: 'installment_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  installment_percentage: number;

  @Column({
    name: 'installment_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  installment_amount: number;

  @Column({
    name: 'paid_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  paid_amount: number;

  @Column({
    name: 'remaining_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  remaining_amount: number;

  @Column({
    type: 'enum',
    enum: InstallmentStatus,
    default: InstallmentStatus.PENDING,
  })
  status: InstallmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => ContractPayment, (payment) => payment.installment)
  payments: ContractPayment[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
