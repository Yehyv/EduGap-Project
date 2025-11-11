import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Institute } from 'src/institutes/entities/institute.entity';
import { Program } from 'src/programs/entities/program.entity';
import { PasswordAction } from './entities/password-action.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepositry: Repository<User>,
    @InjectRepository(Institute)
    private readonly instituteRepositry: Repository<Institute>,
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    @InjectRepository(PasswordAction)
    private readonly passwordActionRepo: Repository<PasswordAction>,
  ) {}

  private async logPasswordAction(
    user: User,
    action: PasswordAction['action'],
  ) {
    const rec = this.passwordActionRepo.create({
      user: { id: user.id },
      action,
    });
    await this.passwordActionRepo.save(rec);
  }

  // Helpers
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  validatePasswordStrength(password: string): boolean {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }

  // Create User with default password = phone, username = national_id
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { instituteId, phone, national_id, ...rest } = createUserDto;
    const username = national_id;
    const hashedPassword = await this.hashPassword(phone);

    const user = this.userRepositry.create({
      ...rest,
      username,
      national_id,
      phone,
      password: hashedPassword,
      institute: instituteId ? { id: instituteId } : undefined,
      is_verified: 0,
      is_active: 1,
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
    const user = await this.userRepositry.findOne({
      where: { id },
      relations: ['institute'],
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepositry.preload({ id, ...updateUserDto });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return this.userRepositry.save(user);
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userRepositry.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    await this.userRepositry.softDelete(id);
    return { message: 'user deleted successfully' };
  }

  // Password Logic
  async isFirstLogin(user: User): Promise<boolean> {
    return bcrypt.compare(user.phone, user.password);
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepositry.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    // التحقق من الباسورد القديم
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    // التحقق من confirm password
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // التحقق من قوة الباسورد
    if (!this.validatePasswordStrength(newPassword)) {
      throw new BadRequestException(
        'Password must be at least 8 characters and include upper, lower, number, and special char.',
      );
    }

    // حفظ الباسورد الجديد
    user.password = await this.hashPassword(newPassword);
    user.is_verified = 1; // ✅ اعتبره اتفعل
    await this.userRepositry.save(user);

    await this.logPasswordAction(user, 'CHANGE_WITH_OLD');

    return { message: 'Password updated successfully' };
  }
  async resetPasswordWithOtp(
    userId: number,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepositry.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    if (!this.validatePasswordStrength(newPassword)) {
      throw new BadRequestException(
        'Password must be at least 8 characters and include upper, lower, number, and special char.',
      );
    }

    user.password = await this.hashPassword(newPassword);
    user.is_verified = 1;
    await this.userRepositry.save(user);

    // ✅ log في الجدول
    await this.logPasswordAction(user, 'RESET_WITH_OTP');

    return { message: 'Password reset successfully' };
  }

  async assignUserToInstitute(
    userId: number,
    instituteId: number,
  ): Promise<User> {
    const user = await this.userRepositry.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    const institute = await this.instituteRepositry.findOne({
      where: { id: instituteId },
    });
    if (!institute)
      throw new NotFoundException(`Institute with id ${instituteId} not found`);

    user.institute = institute;
    return this.userRepositry.save(user);
  }
  async findByUsername(username: string) {
    return this.userRepositry.findOne({
      where: { username },
      relations: [
        'institute',
        'institute.translations',
        'institute.translations.language',
      ],
    });
  }

  async assignUserToProgram(userId: number, programId: number): Promise<User> {
    const user = await this.userRepositry.findOne({
      where: { id: userId },
      relations: ['program'],
    });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    const program = await this.programRepository.findOne({
      where: { id: programId },
    });
    if (!program)
      throw new NotFoundException(`Program with id ${programId} not found`);

    user.program = program;
    return this.userRepositry.save(user);
  }

  async getMeMinimal(userId: number, languageId?: number) {
    const user = await this.userRepositry.findOne({
      where: { id: userId },
      relations: [
        'program',
        'institute',
        'institute.translations',
        'institute.translations.language',
      ],
    });
    if (!user) throw new NotFoundException('User not found');

    const instituteName =
      user.institute?.translations?.find((t) => t.language?.id === languageId)
        ?.name ??
      user.institute?.translations?.[0]?.name ??
      '';

    return {
      userName: user.full_name ?? user.username ?? '',
      userImage: user.user_image,
      instituteName,
      logo: user.institute?.logo ?? '',
      programId: user.program?.id ?? null,
    };
  }
}
