import { Content } from 'src/contents/entities/content.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
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
  OneToMany,
  ManyToOne,
} from 'typeorm';
@Entity()
export class Educator {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 500 })
  bio: string;

  @Column({ type: 'varchar', length: 255 })
  image: string;

  @Column({ name: 'video_intro', type: 'text', nullable: true })
  video_intro: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  is_active: number;

  @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // ده اللي بيضيف عمود user_id في جدول educators
  user: User;

  @OneToMany(() => Content, (content) => content.educator)
  contents: Content[];

  @ManyToOne(() => SystemUser, (sysUser) => sysUser.institutes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: SystemUser;
}
