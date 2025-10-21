/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Institute } from 'src/institutes/entities/institute.entity';
import { Program } from 'src/programs/entities/program.entity';
import { Course } from 'src/courses/entities/course.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';

@Entity('institute_program_course')
export class InstituteProgramCourse {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Institute, { onDelete: 'CASCADE' })
  institute: Institute;

  @ManyToOne(() => Program, { onDelete: 'CASCADE' })
  program: Program;

  @ManyToOne(() => Course, (course) => course.instituteProgramCourses,{ onDelete: 'CASCADE' })
  course: Course;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;

  @Column({ type: 'enum', enum: [0, 1], default: 1 })
  is_active: number;
}
