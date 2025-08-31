import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Program } from './program.entity';
import { Language } from 'src/languages/entities/language.entity';
@Entity()
export class ProgramTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  languageId: number;

  @Column()
  programId: number;

  @ManyToOne(() => Program, (program) => program.translations, {
    onDelete: 'CASCADE',
  })
  program: Program;

  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;
}
