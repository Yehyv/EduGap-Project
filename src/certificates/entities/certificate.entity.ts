import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { User } from 'src/users/entities/user.entity';

export enum CertificateType {
  CONTENT = 0,
  PACKAGE = 1,
}

export enum CertificateLanguage {
  AR = 'ar',
  EN = 'en',
}

@Entity()
export class Certificate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  serialNumber: string;

  @Column({ type: 'tinyint', default: CertificateType.CONTENT })
  type: CertificateType;

  @Column({
    type: 'enum',
    enum: CertificateLanguage,
    default: CertificateLanguage.AR,
  })
  language: CertificateLanguage;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  title: string; // اسم المحتوى أو الباكدج

  @Column({ type: 'varchar', length: 255, nullable: true })
  userCertificateName: string; // الاسم اللي اختاره المستخدم على الشهادة

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  issueDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hours: number;

  @CreateDateColumn()
  createdAt: Date;
}
