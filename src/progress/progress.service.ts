import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Lesson) private lessonRepo: Repository<Lesson>,
    @InjectRepository(LessonProgress)
    private progressRepo: Repository<LessonProgress>,
    @InjectRepository(Enrollment) private enrollRepo: Repository<Enrollment>,
  ) {}

  async completeLesson(lessonId: number, userId: number) {
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
      relations: ['topic', 'topic.content'],
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const enrollment = await this.enrollRepo.findOne({
      where: { user: { id: userId }, content: { id: lesson.topic.content.id } },
      relations: ['user', 'content'],
    });
    if (!enrollment)
      throw new ForbiddenException('Not enrolled in this course');

    // تحقق من السابق لو مش أول درس
    if (lesson.order_id > 0) {
      const prev = await this.lessonRepo.findOne({
        where: {
          topic: { id: lesson.topic.id },
          order_id: lesson.order_id - 1,
        },
      });
      if (prev) {
        const prevCompleted = await this.progressRepo.exist({
          where: {
            lesson: { id: prev.id },
            enrollment: { id: enrollment.id },
            user: { id: userId },
          },
        });
        if (!prevCompleted) {
          throw new BadRequestException('Previous lesson not completed');
        }
      }
    }

    // ⬇️ upsert: لو موجود ما يعملش duplicate، لو مش موجود ينشئ
    try {
      const entity = this.progressRepo.create({
        lesson: { id: lesson.id },
        enrollment: { id: enrollment.id },
        user: { id: userId },
      });
      await this.progressRepo.save(entity); // unique index يمنع التكرار
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // already exists -> ignore
    }

    // رجّع الدرس التالي + حالة فتحه
    const next = await this.lessonRepo.findOne({
      where: { topic: { id: lesson.topic.id }, order_id: lesson.order_id + 1 },
      relations: ['topic'],
      order: { order_id: 'ASC' },
    });

    let nextUnlocked = false;
    if (next) {
      // بما إننا لسه كمّلنا الحالي، يبقى التالي مفتوح دلوقتي
      nextUnlocked = true;
    }

    return {
      completedLessonId: lesson.id,
      nextLesson: next
        ? {
            id: next.id,
            order_id: next.order_id,
            title: undefined, // ضيف الترجمة لو عاوز
            isUnlocked: nextUnlocked,
          }
        : null,
    };
  }
}
