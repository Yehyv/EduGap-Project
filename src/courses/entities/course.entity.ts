import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { CourseTranslation } from './course-translation.entity';
import { Program } from 'src/programs/entities/program.entity';
import { Content } from 'src/contents/entities/content.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  image: string;
  contentCount: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
  @OneToMany(() => CourseTranslation, (translation) => translation.course, {
    cascade: true,
  })
  translations: CourseTranslation[];
  @ManyToMany(() => Program, (program) => program.courses)
  programs: Program[];
  @ManyToMany(() => Content, (content) => content.courses)
  @JoinTable({
    name: 'course_contents',
  })
  contents: Content[];
}
