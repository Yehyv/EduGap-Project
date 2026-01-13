import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSystemRoleDto } from './dto/create-system-role.dto';
import { UpdateSystemRoleDto } from './dto/update-system-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemRole } from './entities/system-role.entity';
import { Repository } from 'typeorm';
@Injectable()
export class SystemRolesService {
  constructor(
    @InjectRepository(SystemRole)
    private readonly sysRoleRepository: Repository<SystemRole>,
  ) {}
  async create(createSystemRoleDto: CreateSystemRoleDto) {
    const role = this.sysRoleRepository.create({
      role_title: createSystemRoleDto.role_title,
      role_category: createSystemRoleDto.role_category,
      is_active: 1,
    });
    console.log(
      typeof createSystemRoleDto.role_category,
      createSystemRoleDto.role_category,
    );
    const saved = await this.sysRoleRepository.save(role);

    return this.findOne(saved.id);
  }

  async findAll(page: number = 1, limit: number = 20) {
    const [items, total] = await this.sysRoleRepository.findAndCount({
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    if (!items) throw new NotFoundException(`NOT FOUND`);
    const mapped = items.map((role) => ({
      id: role.id,
      is_active: role.is_active,
      role_title: role.role_title,
      role_category: role.role_category,
      created_at: role.created_at,
      updated_at: role.updated_at,
      deleted_at: role.deleted_at,
    }));
    return {
      items: mapped,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: number) {
    const role = await this.sysRoleRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Role with id ${id} not found`);
    return {
      id: role.id,
      role_title: role.role_title,
      is_active: role.is_active,
      role_category: role.role_category,
      created_at: role.created_at,
      updated_at: role.updated_at,
      deleted_at: role.deleted_at,
    };
  }

  async update(id: number, updateSystemRoleDto: UpdateSystemRoleDto) {
    const role = await this.sysRoleRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Role with id ${id} not found`);
    Object.assign(role, updateSystemRoleDto);

    await this.sysRoleRepository.save(role);

    return role;
  }

  async remove(id: number) {
    const role = await this.sysRoleRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Role with id ${id} not found`);
    await this.sysRoleRepository.softDelete(id);
    return { message: `Role with id ${id} deleted successfully` };
  }
  async restore(id: number) {
    await this.sysRoleRepository.restore(id);
    return { message: `Role with id ${id} restored successfully` };
  }
  async toggleActive(id: number) {
    const role = await this.sysRoleRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    role.is_active = role.is_active === 1 ? 0 : 1;
    await this.sysRoleRepository.save(role);
    return {
      message: `Role ${id} is now ${role.is_active ? 'active' : 'inactive'}.`,
    };
  }
}
