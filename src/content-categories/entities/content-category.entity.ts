import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContentCategoryTranslation } from './content-category-translation.entity';
import { Content } from 'src/contents/entities/content.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
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
  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
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

  @ManyToOne(() => SystemUser, (sysUser) => sysUser.institutes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: SystemUser;
}
