import { Content } from 'src/contents/entities/content.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['user', 'content']) // منع التكرار
export class SavedContent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.savedContents, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Content, (content) => content.savedByUsers, {
    onDelete: 'CASCADE',
  })
  content: Content;

  @CreateDateColumn()
  savedAt: Date;
}
