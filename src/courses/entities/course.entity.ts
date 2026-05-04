import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CourseTranslation } from './course-translation.entity';
import { ProgramCourse } from 'src/programs/entities/program-course.entity';
import { CourseContent } from './course-content.entity';
import { InstituteProgramCourse } from 'src/institutes/entities/institute-program-course.entity';
import { SavedCourse } from 'src/saved-courses/entities/saved-course.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { CourseCategory } from 'src/course-categories/entities/course-category.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  image: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  isActive: number;

  @OneToMany(() => CourseTranslation, (translation) => translation.course, {
    cascade: true,
  })
  translations: CourseTranslation[];

  @OneToMany(() => ProgramCourse, (programCourse) => programCourse.course)
  programCourses: ProgramCourse[];

  @OneToMany(() => CourseContent, (cc) => cc.course, {
    cascade: true,
  })
  courseContents: CourseContent[];

  @OneToMany(() => InstituteProgramCourse, (ipc) => ipc.course)
  instituteProgramCourses: InstituteProgramCourse[];
  savedByUsers: any;

  @OneToMany(() => SavedCourse, (savedCourse) => savedCourse.course)
  savedCourseByUser: SavedCourse[];

  @ManyToOne(() => SystemUser, (sysUser) => sysUser.institutes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: SystemUser;

  @ManyToOne(() => CourseCategory, (courseCategory) => courseCategory.courses, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'course_category_id' })
  courseCategory: CourseCategory;
}
