import { Content } from 'src/contents/entities/content.entity';
import { PackageEnrollment } from 'src/package-enrollments/entities/package-enrollment.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  status: number;

  // enrollment.entity.ts
  @Column({ type: 'int', default: 0 })
  rating: number; // 0 = لم يقيّم بعد

  @CreateDateColumn()
  created_at: Date;
  @ManyToOne(() => User, (user) => user.enrollments, {
    onDelete: 'CASCADE',
  })
  user: User;
  @ManyToOne(() => Content, (content) => content.enrollments, {
    onDelete: 'CASCADE',
  })
  content: Content;
  @OneToMany(() => LessonProgress, (progress) => progress.enrollment)
  progress: LessonProgress[];

  @ManyToOne(() => PackageEnrollment, (pkgEnr) => pkgEnr.contentsEnrollment, {
    nullable: true,
  })
  packageEnrollment?: PackageEnrollment;
}
