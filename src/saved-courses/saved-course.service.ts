// src/saved-courses/saved-courses.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedCourse } from './entities/saved-course.entity';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SavedCoursesService {
  constructor(
    @InjectRepository(SavedCourse)
    private readonly savedRepo: Repository<SavedCourse>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Save (bookmark) a course for a user.
   * - Idempotent: لو محفوظ قبل كده بيرجّع نفس السجل.
   * - بيرجّع الكيان بعد ربطه.
   */
  async saveCourse(userId: number, courseId: number): Promise<SavedCourse> {
    const [user, course] = await Promise.all([
      this.userRepo.findOne({ where: { id: userId } }),
      this.courseRepo.findOne({ where: { id: courseId } }),
    ]);

    if (!user) throw new NotFoundException('User not found');
    if (!course) throw new NotFoundException('Course not found');

    // هل محفوظ قبل كده (حتى لو متشال soft)؟
    // NOTE: withDeleted() عشان نرجّع السجل لو كان اتعمله soft-delete قبل كده
    const existing = await this.savedRepo
      .createQueryBuilder('sc')
      .withDeleted()
      .leftJoin('sc.user', 'u')
      .leftJoin('sc.course', 'c')
      .where('u.id = :userId AND c.id = :courseId', { userId, courseId })
      .getOne();

    if (existing) {
      // لو كان محذوف soft: رجّعه
      if (existing.deletedAt) {
        await this.savedRepo.restore(existing.id);
        existing.deletedAt = null;
      }
      return existing;
    }

    const saved = this.savedRepo.create({ user, course });
    return this.savedRepo.save(saved);
  }

  /**
   * Unsave (remove bookmark) for a user/course.
   * - Soft delete للحفاظ على التاريخ.
   * - Idempotent: لو مش موجود بيعدّي من غير error.
   */
  async unsaveCourse(userId: number, courseId: number): Promise<void> {
    const saved = await this.savedRepo
      .createQueryBuilder('sc')
      .leftJoin('sc.user', 'u')
      .leftJoin('sc.course', 'c')
      .where('u.id = :userId AND c.id = :courseId', { userId, courseId })
      .getOne();

    if (!saved) return; // مفيش حاجة تتشال

    await this.savedRepo.softDelete(saved.id);
  }

  /**
   * Toggle: لو محفوظ يشيله، لو مش محفوظ يحفظه.
   * بيرجّع حالة الحفظ بعد التنفيذ.
   */
  async toggleSave(
    userId: number,
    courseId: number,
  ): Promise<{ isSaved: boolean }> {
    const isSaved = await this.isSaved(userId, courseId);
    if (isSaved) {
      await this.unsaveCourse(userId, courseId);
      return { isSaved: false };
    } else {
      await this.saveCourse(userId, courseId);
      return { isSaved: true };
    }
  }

  /**
   * Check if a course is saved by user.
   */
  async isSaved(userId: number, courseId: number): Promise<boolean> {
    const found = await this.savedRepo
      .createQueryBuilder('sc')
      .leftJoin('sc.user', 'u')
      .leftJoin('sc.course', 'c')
      .where('u.id = :userId AND c.id = :courseId', { userId, courseId })
      .getExists();

    return found;
  }

  /**
   * Get list of saved courses for a user with pagination and optional search.
   * searchByTitle: يفلتر حسب ترجمة/اسم الكورس لو متاح.
   */
  async listUserSavedCourses(
    userId: number,
    opts?: { page?: number; limit?: number; search?: string },
  ): Promise<{
    data: Array<{ savedId: number; savedAt: Date; course: Course }>;
    page: number;
    limit: number;
    total: number;
  }> {
    // sanitize inputs
    const rawPage = Number(opts?.page);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

    const rawLimit = Number(opts?.limit);
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, rawLimit) : 20;

    const qb = this.savedRepo
      .createQueryBuilder('sc')
      .leftJoinAndSelect('sc.course', 'course')
      .leftJoin('sc.user', 'u')
      .where('u.id = :userId', { userId });

    // search via translations if provided
    if (opts?.search?.trim()) {
      qb.leftJoin('course.translations', 't')
        // PostgreSQL: ILIKE. لو MySQL استخدم LOWER(...) LIKE LOWER(:q)
        .andWhere('(t.title ILIKE :q OR t.short_title ILIKE :q)', {
          q: `%${opts.search.trim()}%`,
        })
        .distinct(true); // منع تكرار الصفوف بسبب الترجمات
    }

    // ⚠️ استخدم اسم الـ property هنا، مش اسم العمود
    qb.orderBy('sc.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    // ✅ total: احسبه بـ clone بدون orderBy/skip/take
    const countQb = qb
      .clone()
      .select('COUNT(DISTINCT sc.id)', 'cnt')
      .orderBy() // clear orderBy
      .limit(undefined) // clear take
      .offset(undefined); // clear skip

    const result: { cnt: string | number } | undefined =
      await countQb.getRawOne();
    const total = Number(result?.cnt ?? 0);

    const rows = await qb.getMany();

    return {
      data: rows.map((r) => ({
        savedId: r.id,
        savedAt: r.createdAt,
        course: r.course,
      })),
      page,
      limit,
      total,
    };
  }

  /**
   * Optional: احذف كل السيفز لمستخدم (soft).
   */
  async clearUserSavedCourses(userId: number): Promise<number> {
    const items = await this.savedRepo.find({
      where: { user: { id: userId } },
      select: ['id'],
    });
    if (!items.length) return 0;
    await this.savedRepo.softDelete(items.map((i) => i.id));
    return items.length;
  }
}
