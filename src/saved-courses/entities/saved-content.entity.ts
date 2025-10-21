import { Content } from 'src/contents/entities/content.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
@Unique(['user', 'content']) // منع التكرار
export class SavedContent {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.savedContents, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Content, (content) => content.savedByUsers, {
    onDelete: 'CASCADE',
  })
  content: Content;
}
