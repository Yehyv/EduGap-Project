import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Language } from 'src/languages/entities/language.entity';
@Entity()
export class CourseTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ name: 'what_to_learn', type: 'simple-array', nullable: true })
  whatToLearn: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => Course, (course) => course.translations, {
    onDelete: 'CASCADE',
  })
  course: Course;
  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;
}
