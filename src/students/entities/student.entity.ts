import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Program } from 'src/programs/entities/program.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  major: string;
  @Column()
  skills: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => User, (user) => user.student)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Program, {
    onDelete: 'CASCADE',
  })
  program: Program;

  @OneToMany(() => LessonProgress, (progress) => progress.student)
  lessonProgresses: LessonProgress[];
}
