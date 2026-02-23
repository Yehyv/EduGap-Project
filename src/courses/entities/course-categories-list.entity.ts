import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('course_categories_list')
export class CourseCategoriesList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'category_name', type: 'varchar', length: 255 })
  category_name: string;

  @Column({
    name: 'category_description',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  category_description: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  is_active: number;

  @Column({ name: 'added_by', type: 'int', nullable: true })
  added_by: number;
}
