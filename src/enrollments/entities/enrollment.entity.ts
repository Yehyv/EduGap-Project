import { Content } from 'src/contents/entities/content.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToMany,
} from 'typeorm';
@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: [0, 1], default: 0 })
  status: number;

  // enrollment.entity.ts
  @Column({ type: 'int', default: 0 })
  rating: number; // 0 = لم يقيّم بعد

  @ManyToOne(() => User, (user) => user.enrollments, {
    onDelete: 'CASCADE',
  })
  user: User;
  @ManyToOne(() => Content, (content) => content.enrollments, {
    onDelete: 'CASCADE',
  })
  content: Content;
  @OneToMany(() => LessonProgress, (progress) => progress.enrollment)
  progress: LessonProgress[];
}
