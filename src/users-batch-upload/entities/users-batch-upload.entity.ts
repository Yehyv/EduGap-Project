import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { UsersBatchUploadError } from './users_batch_upload_errors.entity';
import { Institute } from 'src/institutes/entities/institute.entity';
import { InstituteAnnualContract } from 'src/institute-annual-contracts/entities/institute-annual-contract.entity';
@Entity('users_batch_upload')
export class UsersBatchUpload {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SystemUser, { nullable: false })
  createdBy: SystemUser;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  originalFileName?: string;

  @Column({ type: 'int', default: 0 })
  totalRows: number;

  @Column({ type: 'int', default: 0 })
  insertedRows: number;

  @Column({ type: 'int', default: 0 })
  ignoredRows: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'PENDING',
  })
  status: 'PENDING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';

  @OneToMany(() => UsersBatchUploadError, (error) => error.batchUpload)
  errors: UsersBatchUploadError[];
  @ManyToOne(() => InstituteAnnualContract, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  contract: InstituteAnnualContract | null;

  @ManyToOne(() => Institute, { nullable: true, onDelete: 'SET NULL' })
  institute: Institute | null;

  @Column({ name: 'academic_year', type: 'int', nullable: true })
  academic_year: number | null;

  @Column({ name: 'batch_name', type: 'varchar', length: 150, nullable: true })
  batch_name: string | null;
}
