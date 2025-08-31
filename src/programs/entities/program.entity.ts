import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ProgramTranslation } from './program-translation.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Institute } from 'src/institutes/entities/institute.entity';
@Entity()
export class Program {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  logo: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
  @OneToMany(() => ProgramTranslation, (translation) => translation.program, {
    cascade: true,
  })
  translations: ProgramTranslation[];
  @ManyToMany(() => Course, (course) => course.programs, {
    cascade: ['insert', 'update'], // هنا اللي إحنا اخترناه
  })
  @JoinTable({
    name: 'program_courses',
  })
  courses: Course[];
  @ManyToMany(() => Institute, (institute) => institute.programs)
  institutes: Institute[];
}
