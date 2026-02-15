import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseCategoryTranslation } from '../entities/course-category-translation.entity';
import { Course } from 'src/courses/entities/course.entity';
@Entity()
export class CourseCategory {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
  @Column({ name: 'isActive', type: 'tinyint', default: 1, width: 1 })
  isActive: number;
  @OneToMany(
    () => CourseCategoryTranslation,
    (translation) => translation.courseCategory,
    {
      cascade: true,
    },
  )
  translations: CourseCategoryTranslation[];

  @OneToMany(() => Course, (course) => course.courseCategory, {
    cascade: true,
  })
  courses: Course[];
}
