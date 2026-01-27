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
import { SystemRole } from 'src/system-roles/entities/system-role.entity';
interface userRow {
  user_id: number;
  user_full_name: string;
  user_username: string;
  user_email: string;
  user_phone: string;
  phone_key: string;
  user_user_image: string;
  user_is_active: number;
  institute_id: number;
  institute_logo: string;
  it_name: string;
  pt_name: string;
  createdAt: Date;
  program_id: number;
  program_name: string;
  role_id: number;
  role_role_title: string;
  role_role_category: number;
}
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
    @InjectRepository(SystemRole)
    private readonly systemRoleRepo: Repository<SystemRole>,
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
    const baseUrl = process.env.APP_URL || '';
    const profileImage = `${baseUrl}/uploads/defaults/default-user.png`;
    const user = this.userRepositry.create({
      ...rest,
      username,
      national_id,
      phone,
      password: hashedPassword,
      institute: instituteId ? { id: instituteId } : undefined,
      is_verified: 0,
      is_active: 1,
      user_image: profileImage,
      UserRole: { id: createUserDto.roleId },
    });

    return this.userRepositry.save(user);
  }

  async findAll() {
    const users = await this.userRepositry.find({
      relations: ['institute', 'institute.translations', 'UserRole'],
    });
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
  async findOne(id: number, languageId?: number) {
    const query = this.userRepositry
      .createQueryBuilder('user')
      .leftJoin('user.institute', 'institute')
      .leftJoin(
        'institute.translations',
        'it',
        languageId ? 'it.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('user.program', 'program')
      .leftJoin(
        'program.translations',
        'pt',
        languageId ? 'pt.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('user.UserRole', 'role')
      .where('user.id = :id', { id })
      .select([
        'user.id',
        'user.full_name',
        'user.username',
        'user.email',
        'user.phone',
        'user.is_active',
        'user.user_image',
        'institute.id',
        'institute.logo',
        'it.name',
        'pt.name',
        'role.role_title',
        'role.id',
        'role.role_category',
      ]);
    const row = await query.getRawOne<userRow>();
    if (!row) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return {
      id: row.user_id,
      full_name: row.user_full_name,
      username: row.user_username,
      email: row.user_email,
      phone: row.user_phone,
      isActive: row.user_is_active,
      user_image: row.user_user_image,
      institute: {
        id: row.institute_id,
        logo: row.institute_logo,
        name: row.it_name,
      },
      role: {
        id: row.role_id,
        role_title: row.role_role_title,
        role_category: row.role_role_category,
      },
      program: row.pt_name,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { programId, instituteId, roleId, ...rest } = updateUserDto;

    const user = await this.userRepositry.findOne({
      where: { id },
      relations: ['program', 'institute', 'role'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // ✔️ تحديث الحقول العادية
    Object.assign(user, rest);

    // ✔️ program
    if (programId !== undefined) {
      const program = await this.programRepository.findOne({
        where: { id: programId },
      });
      if (!program) {
        throw new NotFoundException(`Program with id ${programId} not found`);
      }
      user.program = program;
    }

    // ✔️ institute
    if (instituteId !== undefined) {
      const institute = await this.instituteRepositry.findOne({
        where: { id: instituteId },
      });
      if (!institute) {
        throw new NotFoundException(
          `Institute with id ${instituteId} not found`,
        );
      }
      user.institute = institute;
    }

    // ✔️ role
    if (roleId !== undefined) {
      const role = await this.systemRoleRepo.findOne({
        where: { id: roleId },
      });
      if (!role) {
        throw new NotFoundException(`Role with id ${roleId} not found`);
      }
      user.UserRole = role;
    }

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
        'UserRole',
      ],
    });
  }

  async assignUserToProgram(
    userId: number,
    programId: number,
  ): Promise<{ message: string; userId: number; programId: number | null }> {
    const [user, program] = await Promise.all([
      this.userRepositry.findOne({
        where: { id: userId },
        relations: ['program'],
      }),
      this.programRepository.findOne({
        where: { id: programId },
      }),
    ]);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (!program) {
      throw new NotFoundException(`Program with id ${programId} not found`);
    }

    // ✔️ already assigned (idempotent)
    if (user.program?.id === programId) {
      return {
        message: 'User already assigned to this program',
        userId,
        programId,
      };
    }

    // ✔️ assign / reassign
    user.program = program;
    await this.userRepositry.save(user);

    return {
      message: 'User assigned to program successfully',
      userId,
      programId,
    };
  }

  async getMeMinimal(userId: number, languageId?: number) {
    const user = await this.userRepositry.findOne({
      where: { id: userId },
      relations: [
        'program',
        'program.translations',
        'program.translations.language',
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
    const programName =
      user.program?.translations?.find((t) => t.language?.id === languageId)
        ?.name ??
      user.program?.translations?.[0]?.name ??
      '';

    return {
      userName: user.full_name ?? user.username ?? '',
      userImage: user.user_image,
      instituteName,
      logo: user.institute?.logo ?? '',
      programId: user.program?.id ?? null,
      programName,
    };
  }
  async changeName(
    userId: number,
    newName: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepositry.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);
    user.full_name = newName;
    await this.userRepositry.save(user);
    return { message: 'Name updated successfully' };
  }
  async changePhone(
    userId: number,
    newPhone: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepositry.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (user.phone === newPhone) {
      throw new BadRequestException('New phone must be different');
    }

    const existing = await this.userRepositry.findOne({
      where: { phone: newPhone },
    });

    if (existing && existing.id !== userId) {
      throw new BadRequestException('Phone number already in use');
    }

    user.phone = newPhone;
    await this.userRepositry.save(user);

    return { message: 'Phone updated successfully' };
  }
  async getProfileInfo(userId: number) {
    const user = await this.userRepositry.findOne({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);
    return {
      full_name: user.full_name,
      user_image: user.user_image,
      phone_key: user.phone_key,
      phone: user.phone,
    };
  }
  async changeProfileImage(
    userId: number,
    imageUrl: string,
  ): Promise<{ message: string; user_image: string }> {
    const user = await this.userRepositry.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(` user with id ${userId} not found`);
    if (!imageUrl || !imageUrl.trim()) {
      throw new BadRequestException(' Invalid image URL ');
    }
    user.user_image = imageUrl;
    await this.userRepositry.save(user);
    return {
      message: 'User image updated successfully',
      user_image: user.user_image,
    };
  }
  async toggleActive(userId: number) {
    const user = await this.userRepositry.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(` user with id ${userId} not found`);
    const userStatus = (user.is_active = user.is_active === 1 ? 0 : 1);
    await this.userRepositry.save(user);
    return {
      message: `User is_active changed to ${userStatus}`,
      is_active: user.is_active,
    };
  }
  async studentsForInst(instituteId: number, languageId?: number) {
    const students = await this.userRepositry
      .createQueryBuilder('user')
      .innerJoin('user.UserRole', 'role')
      .leftJoin('user.program', 'program')
      .leftJoin(
        'program.translations',
        'pt',
        languageId ? 'pt.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('user.institute', 'institute')
      .where('role.role_title = :roleTitle', { roleTitle: 'student' })
      .andWhere('institute.id = :instituteId', { instituteId })
      .select([
        'user.id AS user_id',
        'user.full_name AS user_full_name',
        'user.user_image AS user_user_image',
        'user.phone_key AS phone_key',
        'user.phone AS user_phone',
        'user.email AS user_email',
        'user.createdAt AS createdAt',

        'program.id AS program_id',
        'pt.name AS program_name',
      ])
      .getRawMany<userRow>();

    return students.map((s) => ({
      id: s.user_id,
      name: s.user_full_name,
      image: s.user_user_image,
      phone: `${s.phone_key}${s.user_phone}`,
      email: s.user_email,
      createdAt: s.createdAt,
      program: s.program_id
        ? {
            id: s.program_id,
            name: s.program_name,
          }
        : null,
    }));
  }
}
