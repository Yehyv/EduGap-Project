import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { CourseTranslation } from './course-translation.entity';
import { Program } from 'src/programs/entities/program.entity';
import { Content } from 'src/contents/entities/content.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { SavedCourse } from 'src/saved-courses/entities/saved-course.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  image: string;
  @Column()
  durateionTime: string;
  @Column({ default: 0 })
  lessonNumber: number;
  @Column({
    type: 'enum',
    enum: ['Beginner', 'Intermediate', 'advanced'],
    default: ['Beginner'],
  })
  level: string;
  @Column({ type: 'float', default: 0 })
  rate: number;
  @Column({ default: 0 })
  numberOfReviewers: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
  @OneToMany(() => CourseTranslation, (translation) => translation.course, {
    cascade: true,
  })
  translations: CourseTranslation[];
  @ManyToMany(() => Program, (program) => program.courses)
  programs: Program[];
  @ManyToMany(() => Content, (content) => content.courses)
  @JoinTable({
    name: 'course_contents',
  })
  contents: Content[];
  @OneToMany(() => Enrollment, (enrollments) => enrollments.course, {
    onDelete: 'CASCADE',
  })
  enrollments: Enrollment[];
  @OneToMany(() => SavedCourse, (savedCourse) => savedCourse.course)
  savedByUsers: SavedCourse[];
}
