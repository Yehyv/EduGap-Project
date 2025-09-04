import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async enrollStudentCourse(
    courseId: number,
    userId: number,
    userInstituteId?: number,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const course = await this.courseRepository.findOne({
      where: {
        id: courseId,
        programs: { institutes: { id: userInstituteId } },
      },
      relations: ['programs', 'programs.institutes'],
    });

    if (!course) {
      throw new NotFoundException(
        `Course ${courseId} not found or not accessible`,
      );
    }

    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        course: { id: courseId },
        user: { id: userId },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('Course already enrolled');
    }

    const enrollment = this.enrollmentRepository.create({
      course,
      user,
      status: 'in progress', // enum
    });

    return this.enrollmentRepository.save(enrollment);
  }
  async unenrollStudentCourse(courseId: number, userId: number) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { course: { id: courseId }, user: { id: userId } },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return this.enrollmentRepository.remove(enrollment);
  }
  async getUserEnrollments(userId: number) {
    //student list all his courses
    return this.enrollmentRepository.find({
      where: { user: { id: userId } },
      relations: ['course', 'course.translations'],
    });
  }
  async getCourseEnrollments(courseId: number) {
    //who enrolled to this course
    return this.enrollmentRepository.find({
      where: { course: { id: courseId } },
      relations: ['user'],
    });
  }
}
