import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Unique,
} from 'typeorm';
import { ContentCategory } from './content-category.entity';
import { Language } from 'src/languages/entities/language.entity';
@Entity()
@Unique(['contentCategory', 'language'])
export class ContentCategoryTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(
    () => ContentCategory,
    (contentCategory) => contentCategory.translations,
    {
      onDelete: 'CASCADE',
    },
  )
  contentCategory: ContentCategory;

  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;
}
