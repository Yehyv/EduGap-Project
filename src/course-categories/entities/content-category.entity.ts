import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
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
