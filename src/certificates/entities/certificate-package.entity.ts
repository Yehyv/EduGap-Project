import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { Certificate } from './certificate.entity';
import { Package } from 'src/packages/entities/package.entity';
@Entity()
export class CertificatePackage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Certificate, { onDelete: 'CASCADE' })
  @JoinColumn()
  certificate: Certificate; // نسخة واحدة من الشهادة (AR أو EN)

  @ManyToOne(() => Package, { onDelete: 'CASCADE' })
  package: Package;

  @Column({ type: 'text' })
  packageContent: string; // كل الـ contents داخل الباكيج (JSON أو نص)
}
