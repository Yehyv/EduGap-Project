import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['user', 'course']) // منع التكرار
export class SavedCourse {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.savedCourses, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Course, (course) => course.savedByUsers, {
    onDelete: 'CASCADE',
  })
  course: Course;

  @CreateDateColumn()
  savedAt: Date;
}
