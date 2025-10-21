/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Content } from 'src/contents/entities/content.entity';

@Entity('content_reviews')
export class ContentReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  review: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // ================= RELATIONS =================

  @ManyToOne(() => User, (user) => user.contentReviews, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Content, (content) => content.reviews, {
    onDelete: 'CASCADE',
  })
  content: Content;
}
