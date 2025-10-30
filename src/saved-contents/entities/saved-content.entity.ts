import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  Unique,
  Index,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Content } from 'src/contents/entities/content.entity';

@Entity()
@Unique(['user', 'content']) // منع التكرار لنفس المستخدم/الدرس
@Index(['user'])
@Index(['content'])
export class SavedContent {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // الأفضل تكون nullable في الكود (حتى لو العمود يطلع NULL)
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.savedContents, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Content, (content) => content.savedByUsers, {
    onDelete: 'CASCADE',
  })
  content: Content;
}
