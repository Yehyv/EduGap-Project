import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Content } from './content.entity';
import { Language } from 'src/languages/entities/language.entity';
@Entity()
export class ContentTranslation {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  description: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
  @ManyToOne(() => Content, (content) => content.translations, {
    onDelete: 'CASCADE',
  })
  content: Content;
  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;
}
