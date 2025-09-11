import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  OneToMany,
  ManyToOne,
  JoinTable,
} from 'typeorm';
import { ContentTranslation } from './content-translation.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { ContentCategory } from 'src/course-categories/entities/content-category.entity';
import { Educator } from 'src/educators/entities/educator.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { SavedContent } from 'src/saved-courses/entities/saved-content.entity';
@Entity()
export class Content {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  image: string;
  @Column({
    type: 'enum',
    enum: ['Beginner', 'Intermediate', 'advanced'],
    default: ['Beginner'],
  })
  level: string;
  @Column({ default: 0 })
  numberOfReviewers: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
  @Column({ type: 'float', default: 0 })
  rate: number;
  @OneToMany(() => ContentTranslation, (translation) => translation.content, {
    cascade: true,
  })
  translations: ContentTranslation[];
  @OneToMany(() => Topic, (topic) => topic.content, {
    cascade: true,
  })
  topics: Topic[];
  lessonsCount?: number;
  completedLessonsCount?: number;
  @ManyToMany(() => Course, (course) => course.contents)
  courses: Course[];
  @ManyToOne(() => ContentCategory, (category) => category.contents, {
    onDelete: 'CASCADE',
  })
  contentCategory: ContentCategory;
  @ManyToMany(() => Educator, (educators) => educators.contents)
  @JoinTable({
    name: 'content_educators',
  })
  educators: Educator[];
  @OneToMany(() => Enrollment, (enrollments) => enrollments.content, {
    onDelete: 'CASCADE',
  })
  enrollments: Enrollment[];
  @OneToMany(() => SavedContent, (savedContent) => savedContent.content)
  savedByUsers: SavedContent[];
}
