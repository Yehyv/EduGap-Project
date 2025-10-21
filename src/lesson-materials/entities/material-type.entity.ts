/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { LessonMaterial } from './lesson-material.entity';

@Entity('materials_types')
export class MaterialType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  type_name: string;

  @Column({ type: 'varchar', length: 50 })
  type_icon: string;

  // ================= TIMESTAMPS =================
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;

  @Column({
    name: 'is_active',
    type: 'enum',
    enum: [0, 1],
    default: 1,
  })
  is_active: number;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  // ================= RELATIONS =================
  @OneToMany(() => LessonMaterial, (material) => material.materialType, {
    cascade: true,
  })
  lessonMaterials: LessonMaterial[];
}
