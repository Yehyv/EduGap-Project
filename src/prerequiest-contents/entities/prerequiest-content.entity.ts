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

  @Column({ type: 'enum', enum: [0, 1], default: 1 })
  type: PrerequisiteType; // 0=optional, 1=mandatory

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
