import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { Program } from './program.entity';
import { Course } from 'src/courses/entities/course.entity';

@Entity('program_course')
@Index('UQ_program_course', ['program', 'course'], { unique: true })
export class ProgramCourse {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date | null;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  isActive: number;

  @ManyToOne(() => Program, (program) => program.programCourses)
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @ManyToOne(() => Course, (course) => course.programCourses)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
