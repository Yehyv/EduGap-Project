/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Content } from 'src/contents/entities/content.entity';
import { MaterialType } from './material-type.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { LessonMaterialTranslation } from './lesson-material-translation.entity';
@Entity('lesson_materials')
export class LessonMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  file: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // ================= RELATIONS =================
  @OneToMany(() => LessonMaterialTranslation, (translation) => translation.lessonMaterial)
  translations: LessonMaterialTranslation[];
  
  @ManyToOne(() => Lesson, (lesson) => lesson.materials, { onDelete: 'CASCADE' })
  lesson: Lesson;

  @ManyToOne(() => MaterialType, (type) => type.lessonMaterials, { onDelete: 'CASCADE' })
  materialType: MaterialType;

  @ManyToOne(() => Content, (content) => content.lessonMaterials, { onDelete: 'CASCADE' })
  content: Content;

  // ================= STATUS =================
  @Column({
    name: 'is_active',
    type: 'enum',
    enum: [0, 1],
    default: 1,
  })
  isActive: number;
}
