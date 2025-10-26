import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';

import { Lesson } from './entities/lesson.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';

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
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = req.user?.sub;
    const lessonId = Number(req.params.id);

    if (!userId) {
      throw new ForbiddenException('Unauthenticated');
    }
    if (!Number.isFinite(lessonId)) {
      throw new NotFoundException('Invalid lesson id');
    }

    // 1) هات الدرس + علاقته بالمحتوى
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
      relations: ['topic', 'topic.content'],
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    // أول درس مفتوح دائمًا
    if (lesson.order_id === 0) return true;

    // 2) تأكد إن اليوزر عامل Enrollment لنفس الـ content
    const contentId = lesson.topic.content.id;
    const enrollment = await this.enrollRepo.findOne({
      where: { user: { id: userId }, content: { id: contentId } },
      // relations مش ضروريين هنا؛ إحنا محتاجين الـ id بس
    });
    if (!enrollment) {
      throw new ForbiddenException('Not enrolled in this course');
    }

    // 3) هات الدرس السابق في نفس الـ topic
    const prev = await this.lessonRepo.findOne({
      where: { topic: { id: lesson.topic.id }, order_id: lesson.order_id - 1 },
      select: ['id'],
    });

    // لو مفيش درس سابق لأي سبب، اعتبره مفتوح (fail-open محكوم)
    if (!prev) return true;

    // 4) تحقّق الإكمال: وجود صف في LessonProgress يربط (user, enrollment, prev_lesson)
    const prevCompleted = await this.progressRepo.exist({
      where: {
        lesson: { id: prev.id },
        enrollment: { id: enrollment.id },
        user: { id: userId },
      },
      // withDeleted: false (افتراضي) — ما تعدش اللي متشال سوفت
    });

    if (!prevCompleted) {
      throw new ForbiddenException('Complete the previous lesson first.');
    }

    return true;
  }
}
