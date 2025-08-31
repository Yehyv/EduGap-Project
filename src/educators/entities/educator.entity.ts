import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
} from 'typeorm';
@Entity()
export class Educator {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  title: string;
  @Column()
  bio: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
  @OneToOne(() => User, (user) => user.educator, {
    onDelete: 'CASCADE',
  })
  user: User;
}
