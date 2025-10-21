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

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ name: 'level_name', type: 'varchar', length: 100 })
  level_name: string;

  @Column({ name: 'what_to_learn', type: 'text', nullable: true })
  what_to_learn: string;

  @Column({
    type: 'enum',
    enum: ['Arabic', 'English', 'French'],
    default: 'Arabic',
  })
  language_type: string;

  @Column({ name: 'previous_background', type: 'text', nullable: true })
  previous_background: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Content, (content) => content.translations, {
    onDelete: 'CASCADE',
  })
  content: Content;
  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;
}
