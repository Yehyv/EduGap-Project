import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(LessonProgress)
    private lessonProgressRepository: Repository<LessonProgress>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
  ) {}

  // async startLesson(
  //   lessonId: number,
  //   userId: number,
  //   userInstituteId?: number,
  // ) {
  //   // نجيب الدرس ونتأكد إنه تابع لمعهد المستخدم
  //   const lesson = await this.lessonRepository
  //     .createQueryBuilder('lesson')
  //     .leftJoinAndSelect('lesson.topic', 'topic')
  //     .leftJoinAndSelect('topic.content', 'content')
  //     .leftJoinAndSelect('content.courses', 'course')
  //     .leftJoin('course.programs', 'program')
  //     .leftJoin('program.institutes', 'institute')
  //     .where('lesson.id = :lessonId', { lessonId })
  //     .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
  //     .getOne();

  //   if (!lesson) {
  //     throw new NotFoundException('Lesson not found or not accessible');
  //   }

  //   // نتأكد إن اليوزر عامل enrollment للكورس بتاع الدرس
  //   const contentId = lesson.topic.content.id;
  //   const enrollment = await this.enrollmentRepository.findOne({
  //     where: {
  //       content: { id: contentId },
  //       user: { id: userId },
  //       status: 'in progress', // التأكد من أن الـ enrollment نشط
  //     },
  //     relations: ['content', 'user'],
  //   });

  //   if (!enrollment) {
  //     throw new BadRequestException(
  //       'User is not enrolled in this course or enrollment is not active',
  //     );
  //   }

  //   // التحقق من وجود progress مسبق
  //   let progress = await this.lessonProgressRepository.findOne({
  //     where: {
  //       lesson: { id: lessonId },
  //       enrollment: { id: enrollment.id },
  //     },
  //     relations: ['lesson', 'enrollment'],
  //   });

  //   if (progress) {
  //     // لو موجود بالفعل ولكن مكتمل، نسمح بإعادة البداية
  //     if (progress.status === 'completed') {
  //       throw new BadRequestException(
  //         'Lesson already completed. Cannot restart.',
  //       );
  //     }
  //     // لو في progress وحالته in progress، نرجعه زي ما هو
  //     return progress;
  //   }

  //   // إنشاء progress جديد
  //   progress = this.lessonProgressRepository.create({
  //     lesson,
  //     enrollment,
  //     status: 'in progress',
  //   });

  //   return await this.lessonProgressRepository.save(progress);
  // }

  // async completeLesson(
  //   lessonId: number,
  //   userId: number,
  //   userInstituteId?: number,
  // ) {
  //   const lesson = await this.lessonRepository
  //     .createQueryBuilder('lesson')
  //     .leftJoinAndSelect('lesson.topic', 'topic')
  //     .leftJoinAndSelect('topic.content', 'content')
  //     .leftJoinAndSelect('content.courses', 'course')
  //     .leftJoin('course.programs', 'program')
  //     .leftJoin('program.institutes', 'institute')
  //     .leftJoinAndSelect('topic.translations', 'translation')
  //     .leftJoinAndSelect('translation.language', 'language')
  //     .where('lesson.id = :lessonId', { lessonId })
  //     .andWhere('institute.id = :instituteId', {
  //       instituteId: userInstituteId,
  //     })
  //     .getOne();

  //   if (!lesson) {
  //     throw new NotFoundException('Lesson not found or not accessible');
  //   }

  //   // نتأكد من enrollment
  //   const contentId = lesson.topic.content.id;
  //   const enrollment = await this.enrollmentRepository.findOne({
  //     where: {
  //       content: { id: contentId },
  //       user: { id: userId },
  //       status: 'in progress',
  //     },
  //     relations: ['content', 'user'],
  //   });

  //   if (!enrollment) {
  //     throw new BadRequestException(
  //       'User is not enrolled in this content or enrollment is not active',
  //     );
  //   }

  //   // البحث عن الـ progress الموجود
  //   let progress = await this.lessonProgressRepository.findOne({
  //     where: {
  //       lesson: { id: lessonId },
  //       enrollment: { id: enrollment.id },
  //     },
  //     relations: ['lesson', 'enrollment'],
  //   });

  //   if (!progress) {
  //     throw new BadRequestException(
  //       'Lesson not started yet. Please start the lesson first.',
  //     );
  //   }

  //   if (progress.status === 'completed') {
  //     throw new BadRequestException('Lesson already completed');
  //   }

  //   // تحديث الحالة إلى completed
  //   progress.status = 'completed';
  //   progress = await this.lessonProgressRepository.save(progress);

  //   // التحقق من اكتمال جميع الدروس في الكورس
  //   await this.checkAndUpdateContentCompletion(enrollment.id, contentId);

  //   return progress;
  // }

  // async getLessonProgress(
  //   lessonId: number,
  //   userId: number,
  //   userInstituteId?: number,
  // ): Promise<LessonProgress | null> {
  //   const progress = await this.lessonProgressRepository
  //     .createQueryBuilder('progress')
  //     .leftJoinAndSelect('progress.lesson', 'lesson')
  //     .leftJoinAndSelect('lesson.topic', 'topic')
  //     .leftJoinAndSelect('topic.content', 'content')
  //     .leftJoin('progress.enrollment', 'enrollment')
  //     .leftJoin('enrollment.user', 'user')
  //     .leftJoin('content.courses', 'course') // optional
  //     .leftJoin('course.programs', 'program')
  //     .leftJoin('program.institutes', 'institute')
  //     .where('lesson.id = :lessonId', { lessonId })
  //     .andWhere('user.id = :userId', { userId })
  //     .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
  //     .getOne();

  //   return progress || null;
  // }

  // async getContentProgress(
  //   contentId: number,
  //   userId: number,
  // ): Promise<{
  //   totalLessons: number;
  //   completedLessons: number;
  //   progressPercentage: number;
  //   lessonProgresses: LessonProgress[];
  // }> {
  //   const enrollment = await this.enrollmentRepository.findOne({
  //     where: {
  //       content: { id: contentId },
  //       user: { id: userId },
  //     },
  //     relations: [
  //       'progress',
  //       'progress.lesson',
  //       'progress.lesson.topic',
  //       'progress.lesson.topic.content',
  //     ],
  //   });

  //   if (!enrollment) {
  //     throw new NotFoundException('User is not enrolled in this content');
  //   }

  //   const totalLessons = await this.lessonRepository
  //     .createQueryBuilder('lesson')
  //     .leftJoin('lesson.topic', 'topic')
  //     .leftJoin('topic.content', 'content')
  //     .where('content.id = :contentId', { contentId })
  //     .getCount();

  //   const completedLessons = enrollment.progress.filter(
  //     (progress) => progress.status === 'completed',
  //   ).length;

  //   const progressPercentage =
  //     totalLessons > 0
  //       ? Math.round((completedLessons / totalLessons) * 100)
  //       : 0;

  //   return {
  //     totalLessons,
  //     completedLessons,
  //     progressPercentage,
  //     lessonProgresses: enrollment.progress,
  //   };
  // }

  // private async checkAndUpdateContentCompletion(
  //   enrollmentId: number,
  //   contentId: number,
  // ): Promise<void> {
  //   // حساب إجمالي الدروس في الـ content
  //   const totalLessons = await this.lessonRepository
  //     .createQueryBuilder('lesson')
  //     .leftJoin('lesson.topic', 'topic')
  //     .leftJoin('topic.content', 'content')
  //     .where('content.id = :contentId', { contentId })
  //     .getCount();

  //   // حساب الدروس المكتملة للطالب
  //   const completedLessons = await this.lessonProgressRepository
  //     .createQueryBuilder('progress')
  //     .leftJoin('progress.lesson', 'lesson')
  //     .leftJoin('lesson.topic', 'topic')
  //     .leftJoin('topic.content', 'content')
  //     .where('progress.enrollment.id = :enrollmentId', { enrollmentId })
  //     .andWhere('progress.status = :status', { status: 'completed' })
  //     .andWhere('content.id = :contentId', { contentId })
  //     .getCount();

  //   // لو جميع الدروس اكتملت، نحديث حالة الـ enrollment
  //   if (totalLessons > 0 && completedLessons === totalLessons) {
  //     await this.enrollmentRepository.update(
  //       { id: enrollmentId },
  //       { status: 'completed' },
  //     );
  //   }
  // }

  // async resetLessonProgress(
  //   lessonId: number,
  //   userId: number,
  //   userInstituteId?: number,
  // ): Promise<void> {
  //   const progress = await this.getLessonProgress(
  //     lessonId,
  //     userId,
  //     userInstituteId,
  //   );

  //   if (!progress) {
  //     throw new NotFoundException('Lesson progress not found');
  //   }

  //   await this.lessonProgressRepository.delete(progress.id);
  // }
}
