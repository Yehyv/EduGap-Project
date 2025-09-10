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
