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

    if (!role) throw new BadRequestException('Invalid roleId');

    const isManager = role.role_title?.toLowerCase() === 'manager';

    // لو Manager لازم instituteId
    if (isManager && !dto.instituteId) {
      throw new BadRequestException('instituteId is required for Manager role');
    }

    // لو مش Manager الأفضل نخليها null (اختياري)
    if (!isManager) {
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
}
