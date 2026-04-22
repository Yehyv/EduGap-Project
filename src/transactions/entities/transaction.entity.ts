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
  SOFT_DELETE = 'SOFT_DELETE',
  RESTORE = 'RESTORE',
  ASSIGN = 'ASSIGN',
  UNASSIGN = 'UNASSIGN',
  ENROLL = 'ENROLL',
  UNENROLL = 'UNENROLL',
  ISSUE_CERTIFICATE = 'ISSUE_CERTIFICATE',
  REQUEST_SUCCESS = 'REQUEST_SUCCESS',
  REQUEST_ERROR = 'REQUEST_ERROR',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  table_name: string;

  @Column({ type: 'varchar', length: 50 })
  trans_type: TransactionType;

  @Column({ type: 'text', nullable: true })
  json_file: string | null;

  @Column({ type: 'int', default: 0 })
  record_id: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => SystemUser, (sysUser) => sysUser.institutes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: SystemUser | null;
}
