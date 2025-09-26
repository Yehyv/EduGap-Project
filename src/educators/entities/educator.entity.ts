import { Content } from 'src/contents/entities/content.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
@Entity()
export class Educator {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  bio: string;
  @Column()
  image: string;
  @CreateDateColumn()
  @Column()
  rate: number;
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
  @OneToOne(() => User, (user) => user.educator, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
  @ManyToMany(() => Content, (contents) => contents.educators)
  contents: Content[];
}
