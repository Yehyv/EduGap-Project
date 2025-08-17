import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { CourseTranslation } from './course-translation.entity';
@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  image: string;
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
}
