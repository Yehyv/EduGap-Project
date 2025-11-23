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

    // نحاول نقرأ من id أو lessonId
    const rawLessonId =
      (req.params && (req.params.id || req.params.lessonId)) ?? undefined;
    const lessonId = rawLessonId ? Number(rawLessonId) : NaN;

    if (!userId) throw new ForbiddenException('Unauthenticated');
    if (!Number.isFinite(lessonId)) {
      throw new NotFoundException('Invalid lesson id');
    }

    const { prev, contentId } =
      await this.lessonsService.getPrevAndNextInContent(lessonId);

    // أول درس في المحتوى مفتوح دائمًا
    if (!prev) return true;

    const enrollment = await this.enrollRepo.findOne({
      where: { user: { id: userId }, content: { id: contentId } },
      select: ['id'],
    });
    if (!enrollment) {
      throw new ForbiddenException('Not enrolled in this course');
    }

    // هنا: أي LessonProgress = الدرس السابق مكتمل
    const prevCompleted = await this.progressRepo.exist({
      where: {
        lesson: { id: prev.id },
        enrollment: { id: enrollment.id },
        user: { id: userId },
      },
    });

    if (!prevCompleted) {
      throw new ForbiddenException('Complete the previous lesson first.');
    }

    return true;
  }
}
