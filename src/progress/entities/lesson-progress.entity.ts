import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Student } from 'src/students/entities/student.entity';

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

  @ManyToOne(() => Student, (student) => student.lessonProgresses, {
    onDelete: 'CASCADE',
  })
  student: Student;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
