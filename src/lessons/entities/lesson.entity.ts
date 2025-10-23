import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  Column,
} from 'typeorm';
import { LessonTranslation } from './lesson-translation.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { SavedLesson } from 'src/saved-lesson/entities/saved-lesson.entity';
import { LessonComment } from 'src/lesson-comments/entities/lesson-comment.entity';
import { LessonMaterial } from 'src/lesson-materials/entities/lesson-material.entity';
import { LessonNote } from 'src/lesson-notes/entities/lesson-note.entity';
import { LessonReaction } from 'src/lesson-reactions/entities/lesson-reaction.entity';
@Entity()
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', nullable: true })
  duration: number;

  @Column({ name: 'order_id', type: 'int' })
  order_id: number;

  @Column({ name: 'video_link', type: 'text', nullable: true })
  video_link: string;

  @Column({ name: 'lesson_type', type: 'enum', enum: [0, 1], default: 0 })
  lesson_type: number; // 0 = lesson , 1 = questions

  @Column({ name: 'questions_percentage_score', type: 'int', nullable: true })
  questions_percentage_score: number; // ex: 70

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  is_active: number;

  @OneToMany(() => LessonTranslation, (translation) => translation.lesson, {
    cascade: true,
  })
  translations: LessonTranslation[];
  @ManyToOne(() => Topic, (topic) => topic.lessons, {
    onDelete: 'CASCADE',
  })
  topic: Topic;
  @OneToMany(() => LessonProgress, (progress) => progress.lesson)
  progresses: LessonProgress[];

  @OneToMany(() => SavedLesson, (savedLesson) => savedLesson.lesson)
  savedByUsers: SavedLesson[];

  @OneToMany(() => LessonComment, (comment) => comment.lesson)
  comments: LessonComment[];

  @OneToMany(() => LessonMaterial, (material) => material.lesson)
  materials: LessonMaterial[];

  @OneToMany(() => LessonNote, (note) => note.lesson)
  notes: LessonNote[];

  @OneToMany(() => LessonReaction, (reaction) => reaction.lesson)
  reactions: LessonReaction[];
}
