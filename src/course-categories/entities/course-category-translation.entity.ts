import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { CourseCategory } from './course-category.entity';
import { Language } from 'src/languages/entities/language.entity';
@Entity()
@Unique(['courseCategory', 'language'])
export class CourseCategoryTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(
    () => CourseCategory,
    (courseCategory) => courseCategory.translations,
    {
      onDelete: 'CASCADE',
    },
  )
  courseCategory: CourseCategory;

  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;
}
