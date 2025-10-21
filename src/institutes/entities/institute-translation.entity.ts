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

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
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
