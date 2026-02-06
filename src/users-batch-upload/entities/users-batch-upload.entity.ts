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
}
