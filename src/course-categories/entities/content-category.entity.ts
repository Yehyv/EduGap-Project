import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Column,
} from 'typeorm';
import { ContentCategoryTranslation } from './content-category-translation.entity';
import { Content } from 'src/contents/entities/content.entity';
@Entity()
export class ContentCategory {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
  @Column({ name: 'is_active', type: 'enum', enum: [0, 1], default: 1 })
  is_active: number;
  @OneToMany(
    () => ContentCategoryTranslation,
    (translation) => translation.contentCategory,
    {
      cascade: true,
    },
  )
  translations: ContentCategoryTranslation[];
  @OneToMany(() => Content, (content) => content.contentCategory, {
    cascade: true,
  })
  contents: Content[];
}
