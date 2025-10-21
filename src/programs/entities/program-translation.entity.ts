import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Program } from './program.entity';
import { Language } from 'src/languages/entities/language.entity';
@Entity()
export class ProgramTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => Program, (program) => program.translations, {
    onDelete: 'CASCADE',
  })
  program: Program;

  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;
}
