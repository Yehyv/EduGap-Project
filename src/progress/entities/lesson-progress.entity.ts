import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';

@Entity()
export class LessonProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['in progress', 'completed'],
    default: 'in progress',
  })
  status: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.progresses, {
    onDelete: 'CASCADE',
  })
  lesson: Lesson;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.progress, {
    onDelete: 'CASCADE',
  })
  enrollment: Enrollment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
