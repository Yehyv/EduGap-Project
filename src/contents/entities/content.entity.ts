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
  JoinColumn,
} from 'typeorm';
import { ContentTranslation } from './content-translation.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { ContentCategory } from 'src/content-categories/entities/content-category.entity';
import { Educator } from 'src/educators/entities/educator.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { CourseContent } from 'src/courses/entities/course-content.entity';
import { ContentReview } from 'src/content-reviews/entities/content-review.entity';
import { SavedLesson } from 'src/saved-lesson/entities/saved-lesson.entity';
import { LessonMaterial } from 'src/lesson-materials/entities/lesson-material.entity';
import { LessonNote } from 'src/lesson-notes/entities/lesson-note.entity';
import { SavedContent } from 'src/saved-contents/entities/saved-content.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
@Entity()
export class Content {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  image: string;

  @Column({
    type: 'enum',
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  })
  level: string;

  @Column({ type: 'tinyint', width: 1, default: 0, name: 'has_prerequiest' })
  hasPrerequiest: number;

  @Column({ type: 'enum', enum: [0, 1], default: 0 })
  has_certificate: number;

  @CreateDateColumn()
  created_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  is_active: number;

  @Column({ name: 'adVideo', type: 'text', nullable: true })
  adVideo: string;

  @Column({
    name: 'is_ai_content',
    type: 'tinyint',
    width: 1,
    default: 0,
  })
  is_ai_content: number;

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
  @ManyToOne(() => ContentCategory, (category) => category.contents, {
    onDelete: 'CASCADE',
  })
  contentCategory: ContentCategory;
  @OneToMany(() => Enrollment, (enrollments) => enrollments.content, {
    cascade: true,
  })
  enrollments: Enrollment[];
  // @OneToMany(() => SavedContent, (savedContent) => savedContent.content)
  // savedByUsers: SavedContent[];

  @OneToMany(() => CourseContent, (cc) => cc.content, {
    cascade: true,
  })
  courseContents: CourseContent[];

  @OneToMany(() => ContentReview, (review) => review.content, { cascade: true })
  reviews: ContentReview[];

  @OneToMany(() => SavedLesson, (savedLesson) => savedLesson.content)
  savedLessons: SavedLesson[];

  @OneToMany(() => LessonMaterial, (material) => material.content)
  lessonMaterials: LessonMaterial[];

  @OneToMany(() => LessonNote, (note) => note.content)
  lessonNotes: LessonNote[];

  @ManyToOne(() => Educator, (educator) => educator.contents, {
    onDelete: 'SET NULL', // أو 'CASCADE' حسب احتياجك
    nullable: true,
  })
  educator: Educator | null;
  @OneToMany(() => SavedContent, (saved) => saved.content)
  savedByUsers: SavedContent[];

  @ManyToOne(() => SystemUser, (sysUser) => sysUser.institutes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: SystemUser;
}
