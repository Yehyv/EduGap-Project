import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { UsersBatchUpload } from './users-batch-upload.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('users_batch_upload_errors')
export class UsersBatchUploadError {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsersBatchUpload, (batch) => batch.errors, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  batchUpload: UsersBatchUpload;

  @Column({ type: 'int' })
  rowNumber: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fieldName?: string;

  @Column({ type: 'varchar', length: 50 })
  errorType: string;
  // examples:
  // DUPLICATE_IN_FILE
  // DUPLICATE_IN_DATABASE
  // INVALID_PHONE
  // INVALID_NATIONAL_ID
  // MISSING_REQUIRED_FIELD

  @Column({ type: 'varchar', length: 255 })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
  @Column({ type: 'json', nullable: true })
  rowData: any;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  studentUser: User | null;

  @Column({
    type: 'enum',
    enum: ['ACCEPTED', 'REJECTED', 'DUPLICATE', 'EXCEEDED_LIMIT'],
    default: 'REJECTED',
  })
  status: 'ACCEPTED' | 'REJECTED' | 'DUPLICATE' | 'EXCEEDED_LIMIT';
}
