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
import { Package } from 'src/packages/entities/package.entity'; // عدّل المسار حسب مشروعك

@Entity('saved_packages')
@Unique(['user', 'package']) // مستخدم واحد مايحفظش نفس الباكدج مرتين
@Index(['user'])
@Index(['package'])
export class SavedPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.savedPackages, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Package, (pkg) => pkg.savedByUsers, { onDelete: 'CASCADE' })
  package: Package;
}
