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
  ManyToOne,
} from 'typeorm';
import { instituteTranslation } from './institute-translation.entity';
import { User } from 'src/users/entities/user.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { Region } from 'src/regions/entities/region.entity';
@Entity()
export class Institute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  logo: string | null;

  @Column({ type: 'text' })
  image_profile: string | null;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 3 })
  phone_key: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  is_active: number;

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
  @OneToMany(() => User, (user) => user.institute, { cascade: true })
  users: User[];

  @OneToMany(() => SystemUser, (sysUser) => sysUser.institute)
  systemUsers: SystemUser[];

  @ManyToOne(() => Region, (region) => region.institutes)
  region: Region;
}
