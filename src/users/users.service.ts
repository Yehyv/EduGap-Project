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
import { ActivationLog } from './entities/activation-log.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
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
  created_by_id: number;
  created_by_name: string;
  user_national_id: string;
  user_student_id: string;
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
    @InjectRepository(ActivationLog)
    private readonly activationLogRepo: Repository<ActivationLog>,
    @InjectRepository(SystemUser)
    private readonly systemUserRepo: Repository<SystemUser>,
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
  async create(createUserDto: CreateUserDto, userId: number): Promise<User> {
    const sysUser = await this.systemUserRepo.findOne({
      where: { id: userId },
    });

    if (!sysUser) {
      throw new NotFoundException(`System user with ID ${userId} not found`);
    }

    // ✅ تحقق من institute
    let institute: Institute | null = null;
    if (createUserDto.instituteId) {
      institute = await this.instituteRepositry.findOne({
        where: { id: createUserDto.instituteId },
      });

      if (!institute) {
        throw new NotFoundException(
          `Institute with ID ${createUserDto.instituteId} not found`,
        );
      }
    }

    // ✅ تحقق من program
    let program: Program | null = null;
    if (createUserDto.programId) {
      program = await this.programRepository.findOne({
        where: { id: createUserDto.programId },
      });

      if (!program) {
        throw new NotFoundException(
          `Program with ID ${createUserDto.programId} not found`,
        );
      }
    }

    const { phone, national_id, ...rest } = createUserDto;

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
      institute: institute ?? undefined,
      program: program ?? undefined,
      added_type: createUserDto.added_type || 0,
      is_verified: 0,
      is_active: 1,
      user_image: profileImage,
      UserRole: { id: createUserDto.roleId },
      createdBy: sysUser,
    });

    return this.userRepositry.save(user);
  }

  async createStudent(
    createUserDto: CreateStudentDto,
    userId: number,
  ): Promise<User> {
    const sysUser = await this.systemUserRepo.findOne({
      where: { id: userId },
    });
    if (!sysUser) {
      throw new NotFoundException(`System user with ID ${userId} not found`);
    }
    const { instituteId, programId, phone, national_id, ...rest } =
      createUserDto;
    const username = national_id;
    const hashedPassword = await this.hashPassword(phone);
    const baseUrl = process.env.APP_URL || '';
    const profileImage = `${baseUrl}/uploads/defaults/default-user.png`;
    const user_role = await this.systemRoleRepo.findOne({
      where: { role_title: 'student' },
    });
    if (!user_role) {
      throw new NotFoundException(`Role with title student not found`);
    }

    const user = this.userRepositry.create({
      ...rest,
      username,
      national_id,
      phone,
      password: hashedPassword,
      institute: instituteId ? { id: instituteId } : undefined,
      program: programId ? { id: programId } : undefined,
      added_type: createUserDto.added_type || 0,
      is_verified: 0,
      is_active: 1,
      user_image: profileImage,
      UserRole: { id: user_role.id },
      createdBy: sysUser,
    });

    return this.userRepositry.save(user);
  }

  async findAll(
    roleCategory?: number,
    languageId?: number,
    page: number = 1,
    limit: number = 10,
    q?: string,
    instituteId?: number,
  ) {
    const skip = (page - 1) * limit;
    const search = q?.trim();

    const baseQb = this.userRepositry
      .createQueryBuilder('user')
      .leftJoin('user.UserRole', 'role')
      .leftJoin('user.institute', 'institute')
      .where('user.deletedAt IS NULL')
      .andWhere('user.is_active = 1');

    if (search) {
      const term = `%${search.toLowerCase()}%`;
      baseQb.andWhere(
        `(
        LOWER(user.full_name)   LIKE :term OR
        LOWER(user.email)       LIKE :term OR
        LOWER(user.phone)       LIKE :term OR
        LOWER(user.national_id) LIKE :term
      )`,
        { term },
      );
    }

    if (roleCategory !== undefined) {
      baseQb.andWhere('role.role_category = :roleCategory', { roleCategory });
    }

    if (instituteId !== undefined) {
      baseQb.andWhere('institute.id = :instituteId', { instituteId });
    }

    const totalRaw = await baseQb
      .clone()
      .select('COUNT(DISTINCT(user.id))', 'cnt')
      .getRawOne<{ cnt: string }>();

    const total = Number(totalRaw?.cnt ?? 0);

    const idsRows = await baseQb
      .clone()
      .select('user.id', 'id')
      .addSelect('user.createdAt', 'createdAt')
      .groupBy('user.id')
      .addGroupBy('user.createdAt')
      .orderBy('user.createdAt', 'DESC')
      .limit(limit)
      .offset(skip)
      .getRawMany<{ id: number }>();

    const ids = idsRows.map((r) => r.id);

    if (!ids.length) {
      return {
        message: 'List of users',
        users: [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: false,
          hasPrev: page > 1,
        },
      };
    }

    const rows = await this.userRepositry
      .createQueryBuilder('user')
      .leftJoin('user.institute', 'institute')
      .leftJoin(
        'institute.translations',
        'it',
        languageId ? 'it.languageId = :languageId' : '1=1',
        languageId ? { languageId } : {},
      )
      .leftJoin('user.UserRole', 'role')
      .leftJoin('user.createdBy', 'createdBy')
      .where('user.id IN (:...ids)', { ids })
      .select([
        'user.id                AS user_id',
        'user.full_name         AS user_full_name',
        'user.phone_key         AS phone_key',
        'user.phone             AS user_phone',
        'user.national_id       AS user_national_id',
        'user.studentId         AS user_student_id', // أو user.student_id حسب اسم العمود الحقيقي عندك
        'user.createdAt         AS createdAt',
        'user.is_active         AS user_is_active',
        'user.user_image        AS user_user_image',
        'createdBy.id           AS created_by_id',
        'createdBy.full_name    AS created_by_name',
        'it.name                AS it_name',
        'role.role_title        AS role_role_title',
        'role.role_category     AS role_role_category',
      ])
      .orderBy('user.createdAt', 'DESC')
      .getRawMany<userRow>();

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'List of users',
      users: rows.map((u) => ({
        id: u.user_id,
        name: u.user_full_name,
        phone: `${u.phone_key ?? ''}${u.user_phone ?? ''}`,
        phone_key: u.phone_key,
        national_id: u.user_national_id,
        studentId: u.user_student_id ?? null,
        institute: u.it_name,
        createdAt: u.createdAt,
        is_active: u.user_is_active,
        user_image: u.user_user_image,
        role: {
          role_title: u.role_role_title,
          role_category: u.role_role_category,
        },
        createdBy: {
          id: u.created_by_id,
          name: u.created_by_name,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
  async exportUsersToExcel(
    res: Response,
    instituteId: number,
    languageId?: number,
  ) {
    const data = await this.studentsForInst(
      instituteId,
      languageId,
      undefined,
      undefined,
      1,
      1000000,
      undefined,
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Phone Key', key: 'phone_key', width: 12 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'National ID', key: 'national_id', width: 20 },
      { header: 'Student ID', key: 'studentId', width: 15 },
      { header: 'Program', key: 'program', width: 25 },
      { header: 'Active', key: 'isActive', width: 10 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    data.items.forEach((s) => {
      worksheet.addRow({
        id: s.id,
        name: s.name,
        phone_key: s.phone_key,
        phone: s.phone,
        email: s.email,
        national_id: s.national_id,
        studentId: s.studentId,
        program: s.program?.name ?? '',
        isActive: s.isActive ? 'Yes' : 'No',
        createdAt: s.createdAt,
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');

    await workbook.xlsx.write(res);
    res.end();
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
      .leftJoin('user.createdBy', 'createdBy')
      .where('user.id = :id', { id })
      .select([
        'user.id AS user_id',
        'user.full_name AS user_full_name',
        'user.username AS user_username',
        'user.email AS user_email',
        'user.phone AS user_phone',
        'user.phone_key AS phone_key',
        'user.is_active AS user_is_active',
        'user.user_image AS user_user_image',
        'user.createdAt AS createdAt',
        'institute.id AS institute_id',
        'institute.logo AS institute_logo',
        'it.name AS it_name',
        'pt.name AS pt_name',
        'role.role_title AS role_role_title',
        'role.id AS role_id',
        'role.role_category AS role_role_category',
        'createdBy.id AS created_by_id',
        'createdBy.full_name AS created_by_name',
        'user.national_id AS user_national_id',
        'user.studentId AS user_student_id',
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
      phone_key: row.phone_key,
      isActive: row.user_is_active,
      user_image: row.user_user_image,
      national_id: row.user_national_id ?? null,
      studentId: row.user_student_id ?? null,
      createdAt: row.createdAt,
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
      createdBy: {
        id: row.created_by_id,
        full_name: row.created_by_name,
      },
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { programId, instituteId, roleId, studentId, ...rest } =
      updateUserDto;

    const user = await this.userRepositry.findOne({
      where: { id },
      relations: ['program', 'institute', 'UserRole'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // تحديث الحقول العادية
    Object.assign(user, rest);

    // studentId
    if (studentId !== undefined) {
      user.studentId = studentId;
    }

    // institute
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

    // role
    if (roleId !== undefined) {
      const role = await this.systemRoleRepo.findOne({
        where: { id: roleId },
      });

      if (!role) {
        throw new NotFoundException(`Role with id ${roleId} not found`);
      }

      user.UserRole = role;
    }

    // program
    if (programId !== undefined) {
      const targetInstituteId = instituteId ?? user.institute?.id;

      if (!targetInstituteId) {
        throw new BadRequestException(
          'User must be assigned to an institute before assigning a program',
        );
      }

      const program = await this.programRepository
        .createQueryBuilder('program')
        .innerJoin(
          'program.institutePrograms',
          'ip',
          'ip.institute_id = :instituteId AND ip.deleted_at IS NULL AND ip.is_active = 1',
          { instituteId: targetInstituteId },
        )
        .where('program.id = :programId', { programId })
        .getOne();

      if (!program) {
        throw new NotFoundException(
          `Program with id ${programId} not found for institute ${targetInstituteId}`,
        );
      }

      user.program = program;
    }

    return this.userRepositry.save(user);
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userRepositry.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    await this.userRepositry.softRemove(user);
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
    instituteId: number,
  ): Promise<{ message: string; userId: number; programId: number | null }> {
    const [user, program] = await Promise.all([
      this.userRepositry.findOne({
        where: { id: userId },
        relations: ['program'],
      }),
      this.programRepository
        .createQueryBuilder('program')
        .where('program.id = :programId', { programId })
        .innerJoin('program.institutePrograms', 'ip')
        .andWhere('ip.institute_id = :instituteId', { instituteId })
        .getOne(),
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
  async activateUser(userId: number, sysUserId: number, reason: string) {
    if (!reason?.trim()) {
      throw new BadRequestException('Activation reason is required');
    }
    const user = await this.userRepositry.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(` user with id ${userId} not found`);
    if (user.is_active === 1) {
      throw new BadRequestException('User is already active');
    }
    user.is_active = 1;
    await this.userRepositry.save(user);

    // Log the activation
    const activationLog = this.activationLogRepo.create({
      reason,
      action: true,
      user: { id: userId },
      systemUser: { id: sysUserId },
    });
    await this.activationLogRepo.save(activationLog);
  }
  async deactivateUser(userId: number, sysUserId: number, reason: string) {
    if (!reason?.trim()) {
      throw new BadRequestException('Deactivation reason is required');
    }
    const user = await this.userRepositry.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(` user with id ${userId} not found`);
    if (user.is_active === 0) {
      throw new BadRequestException('User is already deactivated');
    }
    user.is_active = 0;
    await this.userRepositry.save(user);

    // Log the deactivation
    const activationLog = this.activationLogRepo.create({
      reason,
      action: false,
      user: { id: userId },
      systemUser: { id: sysUserId },
    });
    await this.activationLogRepo.save(activationLog);
  }
  async studentsForInst(
    instituteId: number,
    languageId?: number,
    programId?: number,
    isActive?: number,
    page: number = 1,
    limit: number = 10,
    q?: string,
  ) {
    const skip = (page - 1) * limit;
    const search = q?.trim();

    const baseQb = this.userRepositry
      .createQueryBuilder('user')
      .innerJoin('user.UserRole', 'role')
      .leftJoin('user.program', 'program')
      .innerJoin('user.institute', 'institute')
      .where('role.role_title = :roleTitle', { roleTitle: 'student' })
      .andWhere('institute.id = :instituteId', { instituteId })
      .andWhere('user.deletedAt IS NULL');

    if (search) {
      const term = `%${search.toLowerCase()}%`;
      baseQb.andWhere(
        `(
        LOWER(user.full_name)   LIKE :term OR
        LOWER(user.email)       LIKE :term OR
        LOWER(user.phone)       LIKE :term OR
        LOWER(user.national_id) LIKE :term
      )`,
        { term },
      );
    }

    if (programId !== undefined) {
      baseQb.andWhere('program.id = :programId', { programId });
    }

    if (isActive !== undefined) {
      baseQb.andWhere('user.is_active = :isActive', { isActive });
    }

    const totalRaw = await baseQb
      .clone()
      .select('COUNT(DISTINCT(user.id))', 'cnt')
      .getRawOne<{ cnt: string }>();

    const total = Number(totalRaw?.cnt ?? 0);

    const idsRows = await baseQb
      .clone()
      .select('user.id', 'id')
      .addSelect('user.createdAt', 'createdAt')
      .groupBy('user.id')
      .addGroupBy('user.createdAt')
      .orderBy('user.createdAt', 'DESC')
      .limit(limit)
      .offset(skip)
      .getRawMany<{ id: number }>();

    const ids = idsRows.map((r) => r.id);

    if (!ids.length) {
      return {
        items: [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: false,
          hasPrev: page > 1,
        },
      };
    }

    const rows = await this.userRepositry
      .createQueryBuilder('user')
      .leftJoin('user.program', 'program')
      .leftJoin(
        'program.translations',
        'pt',
        languageId ? 'pt.languageId = :languageId' : '1=1',
        languageId ? { languageId } : {},
      )
      .where('user.id IN (:...ids)', { ids })
      .select([
        'user.id AS user_id',
        'user.full_name AS user_full_name',
        'user.user_image AS user_user_image',
        'user.phone_key AS phone_key',
        'user.phone AS user_phone',
        'user.email AS user_email',
        'user.national_id AS user_national_id',
        'user.studentId AS user_student_id',
        'user.createdAt AS createdAt',
        'user.is_active AS user_is_active',
        'program.id AS program_id',
        'pt.name AS program_name',
      ])
      .orderBy('user.createdAt', 'DESC')
      .getRawMany<userRow>();

    const totalPages = Math.ceil(total / limit);

    return {
      items: rows.map((s) => ({
        id: s.user_id,
        name: s.user_full_name,
        image: s.user_user_image,
        phone: `${s.phone_key ?? ''}${s.user_phone ?? ''}`,
        phone_key: s.phone_key,
        email: s.user_email,
        national_id: s.user_national_id,
        studentId: s.user_student_id,
        createdAt: s.createdAt,
        isActive: s.user_is_active,
        program: s.program_id
          ? { id: s.program_id, name: s.program_name }
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async stuffForInstitute(
    instituteId: number,
    languageId?: number,
    programId?: number,
    isActive?: number,
    page: number = 1,
    limit: number = 10,
    q?: string,
  ) {
    const skip = (page - 1) * limit;
    const search = q?.trim();

    // ✅ Base filter query
    const baseQb = this.userRepositry
      .createQueryBuilder('user')
      .innerJoin('user.UserRole', 'role')
      .leftJoin('user.program', 'program')
      .innerJoin('user.institute', 'institute')
      .where('role.role_title <> :roleTitle', { roleTitle: 'student' })
      .andWhere('institute.id = :instituteId', { instituteId })
      .andWhere('user.deletedAt IS NULL');

    if (search) {
      const term = `%${search.toLowerCase()}%`;
      baseQb.andWhere(
        `(
        LOWER(user.full_name)   LIKE :term OR
        LOWER(user.email)       LIKE :term OR
        LOWER(user.phone)       LIKE :term OR
        LOWER(user.national_id) LIKE :term
      )`,
        { term },
      );
    }

    if (programId !== undefined) {
      baseQb.andWhere('program.id = :programId', { programId });
    }

    if (isActive !== undefined) {
      baseQb.andWhere('user.is_active = :isActive', { isActive });
    }

    // ✅ 1️⃣ Count distinct users
    const totalRaw = await baseQb
      .clone()
      .select('COUNT(DISTINCT(user.id))', 'cnt')
      .getRawOne<{ cnt: string }>();

    const total = Number(totalRaw?.cnt ?? 0);

    // ✅ 2️⃣ Paginated IDs
    const idsRows = await baseQb
      .clone()
      .select('user.id', 'id')
      .addSelect('user.createdAt', 'createdAt')
      .groupBy('user.id')
      .addGroupBy('user.createdAt')
      .orderBy('user.createdAt', 'DESC')
      .limit(limit)
      .offset(skip)
      .getRawMany<{ id: number }>();

    const ids = idsRows.map((r) => r.id);

    if (!ids.length) {
      return {
        items: [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: false,
          hasPrev: page > 1,
        },
      };
    }

    // ✅ 3️⃣ Full data fetch for those IDs only
    const rows = await this.userRepositry
      .createQueryBuilder('user')
      .leftJoin('user.program', 'program')
      .leftJoin(
        'program.translations',
        'pt',
        languageId ? 'pt.languageId = :languageId' : '1=1',
        languageId ? { languageId } : {},
      )
      .where('user.id IN (:...ids)', { ids })
      .select([
        'user.id          AS user_id',
        'user.full_name   AS user_full_name',
        'user.user_image  AS user_user_image',
        'user.phone_key   AS phone_key',
        'user.phone       AS user_phone',
        'user.email       AS user_email',
        'user.createdAt   AS createdAt',
        'program.id       AS program_id',
        'pt.name          AS program_name',
        'user.is_active    AS user_is_active',
      ])
      .orderBy('user.createdAt', 'DESC')
      .getRawMany<userRow>();

    const totalPages = Math.ceil(total / limit);

    return {
      items: rows.map((s) => ({
        id: s.user_id,
        name: s.user_full_name,
        image: s.user_user_image,
        phone: `${s.phone_key ?? ''}${s.user_phone ?? ''}`,
        email: s.user_email,
        createdAt: s.createdAt,
        isActive: s.user_is_active,
        program: s.program_id
          ? { id: s.program_id, name: s.program_name }
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
  async countStudents(
    instituteId?: number,
    programId?: number,
    currentUserInstituteId?: number,
    role?: string,
  ) {
    const isInstituteAdmin = role === 'INST_ADMIN';

    const scopedInstituteId = isInstituteAdmin
      ? currentUserInstituteId
      : instituteId;

    const qb = this.userRepositry
      .createQueryBuilder('user')
      .innerJoin('user.UserRole', 'role')
      .leftJoin('user.institute', 'institute')
      .leftJoin('user.program', 'program')
      .where('user.deletedAt IS NULL')
      .andWhere('user.is_active = 1')
      .andWhere('role.role_title = :roleTitle', { roleTitle: 'student' });

    if (scopedInstituteId !== undefined && scopedInstituteId !== null) {
      qb.andWhere('institute.id = :instituteId', {
        instituteId: scopedInstituteId,
      });
    }

    if (programId !== undefined && programId !== null) {
      qb.andWhere('program.id = :programId', { programId });
    }

    const row = await qb
      .select('COUNT(DISTINCT(user.id))', 'totalStudents')
      .getRawOne<{ totalStudents: string }>();

    return {
      totalStudents: Number(row?.totalStudents ?? 0),
    };
  }
}
