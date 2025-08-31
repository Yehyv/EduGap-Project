import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Institute } from 'src/institutes/entities/institute.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepositry: Repository<User>,
    @InjectRepository(Institute)
    private readonly instituteRepositry: Repository<Institute>,
  ) {}
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { instituteId, password, ...rest } = createUserDto;
    const hashedPassword = await this.hashPassword(password);
    const user = this.userRepositry.create({
      ...rest,
      password: hashedPassword,
      instituteId,
    });
    return this.userRepositry.save(user);
  }

  async findAll() {
    const users = await this.userRepositry.find({ relations: ['institute'] });
    return { message: 'List of users', users };
  }

  async findByEmail(email: string) {
    return await this.userRepositry.findOne({
      where: { email },
      relations: ['institute'],
    });
  }

  async findById(id: number) {
    console.log('ID received:', id, 'Type:', typeof id);
    try {
      const user = await this.userRepositry.findOneBy({ id });
      console.log('SQL Query result:', user);
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      console.log('Error in findById:', error.message);
      throw error; // إعادة throw الـ error
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepositry.preload({ id, ...updateUserDto });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.userRepositry.save(user);
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userRepositry.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    await this.userRepositry.softDelete(id);
    return { message: 'user deleted succecssfully' };
  }
}
