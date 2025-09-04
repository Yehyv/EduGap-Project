import { Educator } from 'src/educators/entities/educator.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { Institute } from 'src/institutes/entities/institute.entity';
import { Student } from 'src/students/entities/student.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SavedCourse } from 'src/saved-courses/entities/saved-course.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'student', 'educator'],
    default: ['student'],
  })
  role: string;

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  @Column()
  instituteId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => Student, (student) => student.user, { cascade: true })
  student: Student;

  @ManyToOne(() => Institute, (institute) => institute.users)
  @JoinColumn({ name: 'instituteId' })
  institute: Institute;

  @OneToOne(() => Educator, (educator) => educator.user, {
    cascade: true,
  })
  @JoinColumn()
  educator: Educator;
  @OneToMany(() => Enrollment, (enrollment) => enrollment.user, {
    cascade: true,
  })
  enrollments: Enrollment;
  @OneToMany(() => SavedCourse, (savedCourse) => savedCourse.user)
  savedCourses: SavedCourse[];
}
