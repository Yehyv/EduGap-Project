import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { Tokens } from 'src/auth/types/tokens.interface';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}
  async create(createStudentDto: CreateStudentDto): Promise<Tokens> {
    const user = this.userRepository.create({
      firstName: createStudentDto.firstName,
      lastName: createStudentDto.lastName,
      email: createStudentDto.email,
      password: createStudentDto.password,
      role: 'student',
    });
    // Save the user first to get the id
    const savedUser = await this.userRepository.save(user);
    const tokens = await this.authService.getTokens(
      savedUser.id,
      savedUser.email,
    );
    await this.authService.updateRefreshToken(
      savedUser.id,
      tokens.refreshToken,
    );

    const student = this.studentRepository.create({
      major: createStudentDto.major,
      skills: createStudentDto.skills,
      user: savedUser,
    });
    await this.studentRepository.save(student);
    return tokens;
  }

  async findAll() {
    try {
      const students = await this.studentRepository.find({
        relations: ['user'],
      });
      return { message: 'List of students', students };
    } catch (error) {
      console.error('Error fetching students:', error);
      throw new Error('Could not fetch students');
    }
  }

  async findById(id: number) {
    try {
      const student = await this.studentRepository.findOne({
        where: { id },
        relations: ['user'],
      });
      if (!student) {
        throw new Error(`Student with ID ${id} not found`);
      }
      return student;
    } catch (error) {
      console.error('Error fetching student by ID:', error);
      throw new Error(`Could not fetch student with ID ${id}`);
    }
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    try {
      const student = await this.studentRepository.preload({
        id,
        ...updateStudentDto,
      });
      if (!student) {
        throw new Error(`Student with ID ${id} not found`);
      }
      return this.studentRepository.save(student);
    } catch (error) {
      console.error('Error updating student:', error);
      throw new Error(`Could not update student with ID ${id}`);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const student = await this.studentRepository.findOne({ where: { id } });
      if (!student) {
        throw new Error(`Student with ID ${id} not found`);
      }
      await this.studentRepository.softDelete(id);
      return { message: 'Student deleted successfully' };
    } catch (error) {
      console.error('Error deleting student:', error);
      throw new Error(`Could not delete student with ID ${id}`);
    }
  }
}
