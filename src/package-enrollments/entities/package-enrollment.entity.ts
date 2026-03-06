import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Package } from 'src/packages/entities/package.entity';
import { User } from 'src/users/entities/user.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';

@Entity()
export class PackageEnrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Package, (pkg) => pkg.id, { onDelete: 'CASCADE' })
  package: Package;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  status: number; // 0=In Progress, 1=Completed

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  completed_at: Date | null;

  @OneToMany(() => Enrollment, (enr) => enr.packageEnrollment)
  contentsEnrollment: Enrollment[];
}
