import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { Tokens } from 'src/auth/types/tokens.interface';
import * as bcrypt from 'bcrypt';
import { Institute } from 'src/institutes/entities/institute.entity';
import { Program } from 'src/programs/entities/program.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    @InjectRepository(Institute)
    private readonly instituteRepository: Repository<Institute>,
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
  ) {}
  async create(createStudentDto: CreateStudentDto): Promise<Tokens> {
    const { programId, ...studentData } = createStudentDto;

    // جلب الـ User
    const user = this.userRepository.create({
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      password: await bcrypt.hash(studentData.password, 10),
      role: 'student',
      instituteId: studentData.instituteId, // User مرتبط بالمعهد
    });

    // جلب البرنامج والتأكد أنه تابع لنفس المعهد
    const program = await this.programRepository.findOne({
      where: { id: programId },
      relations: ['institutes'],
    });
    if (!program) throw new NotFoundException(`Program ${programId} not found`);
    const isRelated = program.institutes.some(
      (inst) => inst.id === user.instituteId,
    );
    if (!isRelated)
      throw new BadRequestException(
        'Program does not belong to this institute',
      );
    const savedUser = await this.userRepository.save(user);
    // إنشاء الطالب وربطه بالـ User والبرنامج
    const student = this.studentRepository.create({
      major: studentData.major,
      skills: studentData.skills,
      user: savedUser,
      program,
    });
    await this.studentRepository.save(student);

    // توليد التوكنز
    const tokens = await this.authService.getTokens(
      savedUser.id,
      savedUser.email,
      savedUser.instituteId,
    );
    await this.authService.updateRefreshToken(
      savedUser.id,
      tokens.refreshToken,
    );

    return tokens;
  }

  async findAll() {
    return this.studentRepository.find({
      relations: ['user', 'program'],
    });
  }

  async findById(id: number) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['user', 'program'],
    });
    if (!student)
      throw new NotFoundException(`Student with ID ${id} not found`);
    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['user', 'program'],
    });
    if (!student)
      throw new NotFoundException(`Student with ID ${id} not found`);

    if (updateStudentDto.programId) {
      const program = await this.programRepository.findOne({
        where: { id: updateStudentDto.programId },
        relations: ['institutes'],
      });
      if (!program) throw new NotFoundException(`Program not found`);
      if (
        !program.institutes.some((inst) => inst.id === student.user.instituteId)
      )
        throw new BadRequestException(
          'Program does not belong to student institute',
        );

      student.program = program;
    }

    if (updateStudentDto.major) student.major = updateStudentDto.major;
    if (updateStudentDto.skills) student.skills = updateStudentDto.skills;

    return this.studentRepository.save(student);
  }

  async remove(id: number) {
    await this.studentRepository.softDelete(id);
    await this.userRepository.softDelete(id);
    return { message: 'Student deleted successfully' };
  }
}
