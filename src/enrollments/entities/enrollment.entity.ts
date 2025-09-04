import { Course } from 'src/courses/entities/course.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  Column,
} from 'typeorm';
@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    type: 'enum',
    enum: ['in progress', 'completed'],
    default: 'in progress',
  })
  status: string;

  @ManyToOne(() => User, (user) => user.enrollments, {
    onDelete: 'CASCADE',
  })
  user: User;
  @OneToMany(() => LessonProgress, (progress) => progress.enrollment, {
    onDelete: 'CASCADE',
  })
  progress: LessonProgress[];
  @ManyToOne(() => Course, (course) => course.enrollments, {
    onDelete: 'CASCADE',
  })
  course: Course;
}
