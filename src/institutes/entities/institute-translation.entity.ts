import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Unique,
} from 'typeorm';
import { Institute } from './institute.entity';
import { Language } from 'src/languages/entities/language.entity';
@Entity()
@Unique(['institute', 'language']) //Unique Constraint to ensure kol unstitute has one translation per language
export class instituteTranslation {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  address: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
  @ManyToOne(() => Institute, (institute) => institute.translations, {
    onDelete: 'CASCADE',
  })
  institute: Institute;
  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;
}
