import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { User } from 'src/users/entities/user.entity';
import { Content } from 'src/contents/entities/content.entity';
import { CourseContent } from 'src/courses/entities/course-content.entity';
import { InstituteProgramCourse } from 'src/institutes/entities/institute-program-course.entity';
import { RateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(CourseContent)
    private readonly courseContentRepo: Repository<CourseContent>,
    @InjectRepository(InstituteProgramCourse)
    private readonly ipcRepo: Repository<InstituteProgramCourse>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Enroll: status=0 (in progress), rating=0
   * مع تحقق الـ multi-tenant عبر IPC
   */
  async enrollStudentContent(
    contentId: number,
    userId: number,
    userInstituteId: number,
  ) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['institute'],
    });
    if (!user) throw new NotFoundException('User not found');

    const content = await this.contentRepo.findOne({
      where: { id: contentId },
    });
    if (!content) throw new NotFoundException(`Content ${contentId} not found`);

    // الكورسات المرتبطة بالمحتوى
    const courseLinks = await this.courseContentRepo.find({
      where: { content: { id: contentId } },
      relations: ['course'],
    });
    if (!courseLinks.length) {
      throw new ForbiddenException('This content is not linked to any course');
    }
    // ✅ تحقق صريح: هل المحتوى ده مربوط بأي كورس مربوط بمعهدي؟
    const allowedCount = await this.ipcRepo
      .createQueryBuilder('ipc')
      .innerJoin('ipc.course', 'course')
      // نربط بـ course_content بحيث يكون نفس الكورس مربوط بالمحتوى
      .innerJoin(
        CourseContent,
        'cc',
        'cc.courseId = course.id AND cc.contentId = :contentId AND cc.deleted_at IS NULL',
        { contentId },
      )
      .where('ipc.instituteId = :iid', { iid: userInstituteId })
      .andWhere('ipc.is_active != 0')
      .andWhere('ipc.deleted_at IS NULL') // لو عندك Soft Delete
      .getCount();

    if (allowedCount === 0) {
      throw new ForbiddenException(
        'This content does not belong to your institute',
      );
    }

    // منع التسجيل المكرر
    const existing = await this.enrollmentRepo.findOne({
      where: { user: { id: userId }, content: { id: contentId } },
    });
    if (existing) {
      throw new BadRequestException('You are already enrolled in this content');
    }

    // تسجيل جديد: status=0, rating=0
    const enrollment = this.enrollmentRepo.create({
      user,
      content,
      status: 0,
      rating: 0,
    });

    return this.enrollmentRepo.save(enrollment);
  }

  /**
   * Unenroll
   */
  async unenrollStudentContent(contentId: number, userId: number) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { user: { id: userId }, content: { id: contentId } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    await this.enrollmentRepo.remove(enrollment);
    return { message: 'Unenrolled successfully' };
  }

  /**
   * الطالب يقيّم محتواه بعد التسجيل
   * - يسمح بالتقييم أو تعديل التقييم
   * - أنت لاحقًا في المتوسط تجاهل 0
   */
  async rateContent(contentId: number, userId: number, dto: RateEnrollmentDto) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { user: { id: userId }, content: { id: contentId } },
    });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    enrollment.rating = dto.rating; // 1..5
    return this.enrollmentRepo.save(enrollment);
  }

  /**
   * هل المستخدم مسجل؟
   */
  async isUserEnrolled(contentId: number, userId: number) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { content: { id: contentId }, user: { id: userId } },
    });
    return !!enrollment;
  }

  /**
   * كل تسجيلات المستخدم (ممكن تسيبها زي ما هي عندك، أضفتها للاكتمال)
   */
  async getUserEnrollments(userId: number) {
    return this.enrollmentRepo.find({
      where: { user: { id: userId } },
      relations: ['content', 'content.translations'],
      order: { id: 'DESC' },
    });
  }

  /**
   * من مسجل في هذا المحتوى
   */
  async getContentEnrollments(contentId: number) {
    return this.enrollmentRepo.find({
      where: { content: { id: contentId } },
      relations: ['user'],
    });
  }
}
