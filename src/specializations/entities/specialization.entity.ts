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
import { SpecializationTranslation } from './specialization-translation.entity';
@Entity('specializations')
export class Specialization {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @Column({ type: 'enum', enum: [0, 1], default: 1 })
  isActive: number;

  @Column({ type: 'int', name: 'created_by', nullable: true })
  createdBy: number;

  // RELATIONS
  @OneToMany(
    () => SpecializationTranslation,
    (translation) => translation.specialization,
    { cascade: true },
  )
  translations: SpecializationTranslation[];
}
