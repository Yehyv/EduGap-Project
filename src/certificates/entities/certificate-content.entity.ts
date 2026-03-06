import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Certificate } from './certificate.entity';
import { Content } from 'src/contents/entities/content.entity';

@Entity()
export class CertificateContent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Certificate, { onDelete: 'CASCADE' })
  @JoinColumn()
  certificate: Certificate; // نسخة واحدة من الشهادة (AR أو EN)

  @ManyToOne(() => Content, { onDelete: 'CASCADE' })
  content: Content;
}
