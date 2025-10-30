import { Institute } from 'src/institutes/entities/institute.entity';
import { SavedCourse } from 'src/saved-courses/entities/saved-course.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserOtp } from './user-otp.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { ContentReview } from 'src/content-reviews/entities/content-review.entity';
import { SavedLesson } from 'src/saved-lesson/entities/saved-lesson.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { LessonComment } from 'src/lesson-comments/entities/lesson-comment.entity';
import { LessonNote } from 'src/lesson-notes/entities/lesson-note.entity';
import { LessonReaction } from 'src/lesson-reactions/entities/lesson-reaction.entity';
import { Program } from 'src/programs/entities/program.entity';
import { Educator } from 'src/educators/entities/educator.entity';
import { SavedContent } from 'src/saved-contents/entities/saved-content.entity';
import { SavedPackage } from 'src/saved-packages/entities/saved-package.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  full_name: string;

  @Column({ unique: true, type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 14 })
  national_id: string;

  @Column({ type: 'varchar', length: 3 })
  phone_key: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'text' })
  user_image: string;

  @Column({ type: 'varchar', length: 30 })
  username: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;

  @Column({ type: 'enum', enum: [0, 1] }) // 0 not verified
  is_verified: number;

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  @Column({ type: 'enum', enum: [0, 1] }) // 0 for phone , 1 for email
  verified_method: number;

  @Column({ type: 'enum', enum: [0, 1] }) // 0 for not active , 1 for active
  is_active: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Institute, (institute) => institute.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'institute_id' })
  institute: Institute;

  @OneToMany(() => SavedCourse, (savedContent) => savedContent.user)
  savedCourses: SavedCourse[];

  @OneToMany(() => UserOtp, (otp) => otp.user)
  otps: UserOtp[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.user, {
    cascade: true,
  })
  enrollments: Enrollment[];

  @OneToMany(() => ContentReview, (reviews) => reviews.user, {
    cascade: true,
  })
  contentReviews: ContentReview[];

  @OneToMany(() => SavedLesson, (savedLesson) => savedLesson.user)
  savedLessons: SavedLesson[];

  @OneToMany(() => LessonProgress, (progress) => progress.user)
  lessonProgress: LessonProgress[];

  @OneToMany(() => LessonComment, (comment) => comment.user)
  lessonComments: LessonComment[];

  @OneToMany(() => LessonNote, (note) => note.user)
  lessonNotes: LessonNote[];

  @OneToMany(() => LessonReaction, (reaction) => reaction.user)
  lessonReactions: LessonReaction[];

  @ManyToOne(() => Program, (program) => program.users)
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @OneToOne(() => Educator, (educator) => educator.user, { cascade: false })
  educator: Educator;

  @OneToMany(() => SavedContent, (saved) => saved.user)
  savedContents: SavedContent[];

  @OneToMany(() => SavedPackage, (saved) => saved.user)
  savedPackages: SavedPackage[];
}
