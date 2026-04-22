import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('apply_messages')
export class ApplyMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  institute_name: string;

  @Column({ type: 'varchar', length: 150 })
  contact_person: string;

  @Column({ type: 'varchar', length: 100 })
  email_address: string;

  @Column({ type: 'varchar', length: 20 })
  phone_number: string;

  @Column({ type: 'text' })
  about_your_institute: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date | null;
}
