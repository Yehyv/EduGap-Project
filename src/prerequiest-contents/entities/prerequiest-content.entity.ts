import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Content } from 'src/contents/entities/content.entity';
export enum PrerequisiteType {
  OPTIONAL = 0,
  MANDATORY = 1,
}

@Entity()
@Unique(['content', 'prerequisiteContent'])
export class PrerequisiteContent {
  @PrimaryGeneratedColumn()
  id: number;

  // الكونتنت المستهدف (اللي اليوزر عايز يشوفه)
  @ManyToOne(() => Content, (c) => c.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contentId' })
  content: Content;

  @Column()
  contentId: number;

  // الكونتنت المطلوب كـ prerequisite
  @ManyToOne(() => Content, (c) => c.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prerequisiteContentId' })
  prerequisiteContent: Content;

  @Column()
  prerequisiteContentId: number;

  @Column({ type: 'tinyint', width: 1, default: 1 })
  type: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
