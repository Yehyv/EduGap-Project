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

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('simple-json', { nullable: true })
  whatToLearn: string[];

  @Column()
  durationTime: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
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
