// src/educator-reviews/entities/educator-review.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  Index,
  Unique,
  JoinColumn,
} from 'typeorm';
import { Content } from 'src/contents/entities/content.entity';
import { Educator } from 'src/educators/entities/educator.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('educator_reviews')
@Unique('UQ_user_educator_content', ['userId', 'educatorId', 'contentId'])
export class EducatorReview {
  @PrimaryGeneratedColumn()
  id: number;

  // 🔗 FK أعمدة صريحة + فهارس
  @Index()
  @Column({ name: 'educator_id' })
  educatorId: number;

  @Index()
  @Column({ name: 'content_id' })
  contentId: number;

  @Index()
  @Column({ name: 'user_id' })
  userId: number;

  // ⭐ التقييم Float
  @Column({ type: 'float', name: 'rating', default: 0 })
  rating: number;

  // ✍️ الريفيو اختياري
  @Column({ type: 'text', nullable: true })
  review?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // علاقات (مع JoinColumn لربط FK الصريح)
  @ManyToOne(() => Educator, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'educator_id' })
  educator: Educator;

  @ManyToOne(() => Content, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  content: Content;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
