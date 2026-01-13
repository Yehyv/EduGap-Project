import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleCategory } from 'src/common/enums/role-category.enum';
import { User } from 'src/users/entities/user.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
@Entity()
export class SystemRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  role_title: string;

  @Column({ type: 'tinyint', width: 1, default: RoleCategory.PORTAL })
  role_category: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @Column({ type: 'tinyint', width: 1, default: 1})
  is_active: number;

  @OneToMany(() => User, (user) => user.UserRole)
  users: User[];

  @OneToMany(() => SystemUser, (sysUser) => sysUser.SysUserrole)
  sysUsers: SystemUser[];
}
