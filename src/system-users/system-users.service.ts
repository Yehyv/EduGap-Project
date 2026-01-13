import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSystemUserDto } from './dto/create-system-user.dto';
import { UpdateSystemUserDto } from './dto/update-system-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemUser } from './entities/system-user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
@Injectable()
export class SystemUsersService {
  constructor(
    @InjectRepository(SystemUser)
    private readonly sysUserRepository: Repository<SystemUser>,
  ) {}
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
  async create(createSystemUserDto: CreateSystemUserDto) {
    const { phone, national_id, ...rest } = createSystemUserDto;
    const username = national_id;
    const hashedPassowrd = await this.hashPassword(phone);
    const baseUrl = process.env.APP_URL || '';
    const profileImage = `${baseUrl}/uploads/defaults/default-user.png`;
    const user = this.sysUserRepository.create({
      ...rest,
      username,
      national_id,
      phone,
      password: hashedPassowrd,
      user_image: profileImage,
    });
    return this.sysUserRepository.save(user);
  }

  async findAll() {
    const users = await this.sysUserRepository.find();
    return { message: 'list of system users', users };
  }

  async findOne(id: number) {
    const user = await this.sysUserRepository.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  update(id: number, updateSystemUserDto: UpdateSystemUserDto) {
    return `This action updates a #${id} systemUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} systemUser`;
  }
}
