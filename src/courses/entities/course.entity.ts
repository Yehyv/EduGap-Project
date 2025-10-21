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
import { ProgramCourse } from 'src/programs/entities/program-course.entity';
import { CourseContent } from './course-content.entity';
import { InstituteProgramCourse } from 'src/institutes/entities/institute-program-course.entity';

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

  @Column({ type: 'enum', enum: [0, 1], default: 1 })
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
}
