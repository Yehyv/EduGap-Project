import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSystemUserDto } from './dto/create-system-user.dto';
import { UpdateSystemUserDto } from './dto/update-system-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemUser } from './entities/system-user.entity';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SystemRole } from 'src/system-roles/entities/system-role.entity';
@Injectable()
export class SystemUsersService {
  constructor(
    @InjectRepository(SystemUser)
    private readonly sysUserRepository: Repository<SystemUser>,
    @InjectRepository(SystemRole)
    private readonly systemRoleRepo: Repository<SystemRole>,
  ) {}
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
  async create(dto: CreateSystemUserDto) {
    const role = await this.systemRoleRepo.findOne({
      where: { id: dto.roleId },
    });
    console.log('Role found:', role);
    if (!role) throw new BadRequestException('Invalid roleId');

    const isInstAdmin = role.role_title === 'INST_ADMIN';

    // لو Manager لازم instituteId
    if (isInstAdmin && !dto.instituteId) {
      throw new BadRequestException(
        'instituteId is required for INST_ADMIN role',
      );
    }

    // لو مش Manager الأفضل نخليها null (اختياري)
    if (!isInstAdmin) {
      dto.instituteId = undefined;
    }

    const { phone, national_id, instituteId, ...rest } = dto;

    const username = national_id;
    const hashedPassword = await this.hashPassword(phone);
    const baseUrl = process.env.APP_URL || '';
    const profileImage = `${baseUrl}/uploads/defaults/default-user.png`;

    const user = this.sysUserRepository.create({
      ...rest,
      username,
      national_id,
      phone,
      password: hashedPassword,
      user_image: profileImage,
      SysUserrole: { id: dto.roleId },
      institute: instituteId ? { id: instituteId } : undefined,
    });

    return this.sysUserRepository.save(user);
  }

  async findAll() {
    const users = await this.sysUserRepository.find({
      relations: ['SysUserrole', 'institute', 'institute.translations'],
    });
    return { message: 'list of system users', users };
  }

  async findOne(id: number) {
    const query = this.sysUserRepository
      .createQueryBuilder('user')
      .leftJoin('user.SysUserrole', 'role')
      .where('user.id = :id', { id })
      .select([
        'user.id',
        'user.full_name',
        'user.username',
        'user.email',
        'user.phone',
        'user.phone_key',
        'user.national_id',
        'user.created_at',
        'user.user_image',
        'role.role_title',
        'role.id',
        'role.role_category',
      ]);
    const user = await query.getOne();
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async update(id: number, updateSystemUserDto: UpdateSystemUserDto) {
    const { roleId, ...rest } = updateSystemUserDto;

    const user = await this.sysUserRepository.findOne({
      where: { id },
      relations: ['SysUserrole'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // ✅ تحديث الحقول العادية فقط
    Object.assign(user, rest);

    // ✅ تحديث الـ role
    if (roleId !== undefined) {
      const role = await this.systemRoleRepo.findOne({
        where: { id: roleId },
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      user.SysUserrole = role;
    }

    return this.sysUserRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.sysUserRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    await this.sysUserRepository.softDelete(id);
    return { message: `User with ID ${id} has been removed` };
  }
  async getAdminMenimal(userId: number) {
    const user = await this.sysUserRepository.findOne({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    const { id, full_name, user_image, email } = user;
    return { id, full_name, user_image, email };
  }
  async findSystemUserByUsername(username: string) {
    return this.sysUserRepository.findOne({
      where: { username },
      relations: [
        'institute',
        'institute.translations',
        'institute.translations.language',
        'SysUserrole',
      ],
    });
  }
  async getInstAdminMinimal(userId: number, languageId?: number) {
    const user = await this.sysUserRepository.findOne({
      where: { id: userId },
      relations: [
        'SysUserrole',
        'institute',
        'institute.translations',
        'institute.translations.language',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const instituteName =
      user.institute?.translations?.find((t) => t.language?.id === languageId)
        ?.name ??
      user.institute?.translations?.[0]?.name ??
      '';

    return {
      userName: user.full_name ?? user.username ?? '',
      userImage: user.user_image ?? '',
      instituteName,
      logo: user.institute?.logo ?? '',
    };
  }

  async toggleActive(userId: number) {
    const user = await this.sysUserRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`SystemUser with ID ${userId} not found`);
    }

    // 🔄 Toggle
    user.is_active = user.is_active ? 0 : 1;

    await this.sysUserRepository.save(user);

    return {
      message: `SystemUser is_active changed to ${user.is_active}`,
      id: user.id,
      is_active: user.is_active,
    };
  }
}
