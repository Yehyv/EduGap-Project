import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { ContentTranslation } from './content-translation.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Topic } from 'src/topics/entities/topic.entity';
@Entity()
export class Content {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  image: string;
  @Column()
  price: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
  @Column()
  rating: number;
  @OneToMany(() => ContentTranslation, (translation) => translation.content, {
    cascade: true,
  })
  translations: ContentTranslation[];
  @OneToMany(() => Topic, (topic) => topic.content, {
    cascade: true,
  })
  topics: Topic[];
  @ManyToMany(() => Course, (course) => course.contents)
  courses: Course[];
}
