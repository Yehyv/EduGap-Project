import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  DeleteDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
@Index('UQ_lesson_enrollment_user', ['lesson', 'enrollment', 'user'], {
  unique: true,
})
export class LessonProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;

  @ManyToOne(() => Lesson, (lesson) => lesson.progresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lesson_id' }) // اسم العمود في DB (اختياري)
  lesson: Lesson;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.progress, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  @ManyToOne(() => User, (user) => user.lessonProgress, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
