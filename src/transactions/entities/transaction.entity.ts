/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SystemUser } from 'src/system-users/entities/system-user.entity';

export enum TransactionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  table_name: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  trans_type: TransactionType;

  @Column({ type: 'text', nullable: true })
  json_file: string;

  @Column({ type: 'int' })
  record_id: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => SystemUser, (sysUser) => sysUser.institutes, {
      nullable: true,
      onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'created_by' })
    createdBy: SystemUser;

}
