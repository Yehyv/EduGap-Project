import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';

import { Lesson } from './entities/lesson.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { LessonsService } from './lessons.service';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}

@Injectable()
export class LessonUnlockGuard implements CanActivate {
  constructor(
    @InjectRepository(Lesson) private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(LessonProgress)
    private readonly progressRepo: Repository<LessonProgress>,
    @InjectRepository(Enrollment)
    private readonly enrollRepo: Repository<Enrollment>,
    @Inject(forwardRef(() => LessonsService))
    private readonly lessonsService: LessonsService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = req.user?.sub;
    const lessonId = Number(req.params.id);

    if (!userId) throw new ForbiddenException('Unauthenticated');
    if (!Number.isFinite(lessonId))
      throw new NotFoundException('Invalid lesson id');

    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
      relations: ['topic', 'topic.content'],
      select: ['id', 'order_id'],
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    // السابق العام داخل نفس المحتوى
    const { prev, contentId } =
      await this.lessonsService.getPrevAndNextInContent(lessonId);

    // أول درس في المحتوى مفتوح دائمًا
    if (!prev) return true;

    // لازم يكون Enrolled
    const enrollment = await this.enrollRepo.findOne({
      where: { user: { id: userId }, content: { id: contentId } },
      select: ['id'],
    });
    if (!enrollment)
      throw new ForbiddenException('Not enrolled in this course');

    // تحقق من إكمال السابق
    const prevCompleted = await this.progressRepo.exist({
      where: {
        lesson: { id: prev.id },
        enrollment: { id: enrollment.id },
        user: { id: userId },
      },
    });
    if (!prevCompleted)
      throw new ForbiddenException('Complete the previous lesson first.');

    return true;
  }
}
