import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Content } from 'src/contents/entities/content.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async enrollStudentContent(
    contentId: number,
    userId: number,
    userInstituteId?: number,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const content = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .where('content.id = :contentId', { contentId })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();
    if (!content) {
      throw new BadRequestException(
        `Content ${contentId} not found or not accessible`,
      );
    }

    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        content: { id: contentId },
        user: { id: userId },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('Content already enrolled');
    }

    const enrollment = this.enrollmentRepository.create({
      content,
      user,
      status: 'in progress', // enum
    });

    return this.enrollmentRepository.save(enrollment);
  }
  async unenrollStudentContent(contentId: number, userId: number) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { content: { id: contentId }, user: { id: userId } },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return this.enrollmentRepository.remove(enrollment);
  }
  async getUserEnrollments(userId: number) {
    //student list all his content
    return this.enrollmentRepository.find({
      where: { user: { id: userId } },
      relations: ['content', 'content.translations'],
    });
  }
  async getContentEnrollments(contentId: number) {
    //who enrolled to this course
    return this.enrollmentRepository.find({
      where: { content: { id: contentId } },
      relations: ['user'],
    });
  }
}
