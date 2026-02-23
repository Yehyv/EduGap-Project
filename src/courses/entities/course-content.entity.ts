import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Unique,
  ManyToOne,
} from 'typeorm';
import { Course } from './course.entity';
import { Content } from 'src/contents/entities/content.entity';

@Entity('course_content')
@Unique('UQ_course_content', ['course', 'content'])
export class CourseContent {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  is_active: number;

  @ManyToOne(() => Course, (course) => course.courseContents, {
    onDelete: 'CASCADE',
  })
  course: Course;

  @ManyToOne(() => Content, (content) => content.courseContents, {
    onDelete: 'CASCADE',
  })
  content: Content;
}
