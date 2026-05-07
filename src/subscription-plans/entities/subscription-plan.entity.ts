import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { InstituteAnnualContract } from 'src/institute-annual-contracts/entities/institute-annual-contract.entity';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'plan_name', type: 'varchar', length: 150 })
  plan_name: string;

  @Column({ name: 'min_students', type: 'int', default: 0 })
  min_students: number;

  @Column({ name: 'max_students', type: 'int' })
  max_students: number;

  @Column({
    name: 'default_price_per_student',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  default_price_per_student: number;

  @Column({ name: 'default_installments_count', type: 'int', default: 4 })
  default_installments_count: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  is_active: number;

  @ManyToOne(() => SystemUser, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy: SystemUser | null;

  @OneToMany(() => InstituteAnnualContract, (contract) => contract.plan)
  contracts: InstituteAnnualContract[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date | null;
}
