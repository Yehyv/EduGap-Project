import { Program } from 'src/programs/entities/program.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { instituteTranslation } from './institute-translation.entity';
import { User } from 'src/users/entities/user.entity';
@Entity()
export class Institute {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  logo: string;
  @Column()
  profileImage: string;
  @Column()
  email: string;
  @Column()
  phone: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
  @OneToMany(
    () => instituteTranslation,
    (translation) => translation.institute,
    {
      cascade: true,
    },
  )
  translations: instituteTranslation[];
  @ManyToMany(() => Program, (program) => program.institutes)
  @JoinTable({
    name: 'institute_programs',
  })
  programs: Program[];

  @OneToMany(() => User, (user) => user.institute)
  users: User[];
}
