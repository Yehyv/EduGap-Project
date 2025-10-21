import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ProgramTranslation } from './program-translation.entity';
import { ProgramCourse } from './program-course.entity';
import { User } from 'src/users/entities/user.entity';
@Entity()
export class Program {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  logo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  isActive: number;

  @OneToMany(() => ProgramTranslation, (translation) => translation.program, {
    cascade: true,
  })
  translations: ProgramTranslation[];

  @OneToMany(() => ProgramCourse, (programCourse) => programCourse.program)
  programCourses: ProgramCourse[];

  @OneToMany(() => User, (user) => user.program)
  users: User[];
}
