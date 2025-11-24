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
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
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
    opts?: {
      page?: number;
      limit?: number;
      search?: string;
      languageId?: number;
    },
  ): Promise<{
    data: Array<{
      id: number;
      image: string | null;
      name: string;
      description: string;
      contentsCount: number;
      totalDuration: number;
    }>;
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

    const languageId = opts?.languageId;

    const qb = this.savedRepo
      .createQueryBuilder('sc')
      .leftJoin('sc.user', 'u')
      .leftJoinAndSelect('sc.course', 'course')
      .leftJoinAndSelect(
        'course.translations',
        'tr',
        languageId ? 'tr.languageId = :languageId' : undefined,
        { languageId },
      )
      .where('u.id = :userId', { userId });

    // 🧐 search via translations if provided
    if (opts?.search?.trim()) {
      const q = `%${opts.search.trim()}%`;

      qb.andWhere('(tr.name ILIKE :q OR tr.description ILIKE :q)', {
        q,
      }).distinct(true);
    }

    qb.orderBy('sc.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    // ✅ total count (بدون pagination)
    const countQb = this.savedRepo
      .createQueryBuilder('sc')
      .leftJoin('sc.user', 'u')
      .leftJoin('sc.course', 'course')
      .leftJoin(
        'course.translations',
        'trCount',
        languageId ? 'trCount.languageId = :languageId' : undefined,
        { languageId },
      )
      .where('u.id = :userId', { userId });

    if (opts?.search?.trim()) {
      const q = `%${opts.search.trim()}%`;
      countQb.andWhere(
        '(trCount.name ILIKE :q OR trCount.description ILIKE :q)',
        { q },
      );
    }

    const result: { cnt: string | number } | undefined = await countQb
      .select('COUNT(DISTINCT sc.id)', 'cnt')
      .getRawOne();
    const total = Number(result?.cnt ?? 0);

    if (!total) {
      return {
        data: [],
        page,
        limit,
        total: 0,
      };
    }

    const rows = await qb.getMany();

    // IDs للكورسات المحفوظة
    const courseIds = rows.map((r) => r.course?.id).filter(Boolean) as number[];

    if (!courseIds.length) {
      return {
        data: [],
        page,
        limit,
        total,
      };
    }

    // 2️⃣ احسب عدد الـ contents و مجموع الـ durations (نفس لوجيك findInstituteProgramCoursesFirstEight)
    const durRows = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin(
        'course_content',
        'cc',
        'cc.courseId = course.id AND cc.deleted_at IS NULL',
      )
      .leftJoin('content', 'c', 'c.id = cc.contentId AND c.deleted_at IS NULL')
      .leftJoin(
        'topic',
        't',
        't.contentId = c.id AND t.deleted_at IS NULL AND t.is_active != 0',
      )
      .leftJoin(
        'lesson',
        'l',
        'l.topicId = t.id AND l.deleted_at IS NULL AND l.is_active != 0',
      )
      .select('course.id', 'id')
      .addSelect('COUNT(DISTINCT c.id)', 'contentsCount')
      .addSelect('COALESCE(SUM(l.duration), 0)', 'totalDuration')
      .where('course.id IN (:...courseIds)', { courseIds })
      .groupBy('course.id')
      .getRawMany<{
        id: string;
        contentsCount: string;
        totalDuration: string;
      }>();

    const countMap = new Map<number, number>(
      durRows.map((r) => [Number(r.id), Number(r.contentsCount)]),
    );
    const durationMap = new Map<number, number>(
      durRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
    );

    // نخلي ترتيب الـ data زي ترتيب السيف
    const orderIndex = new Map<number, number>(
      courseIds.map((id, i) => [id, i]),
    );

    const data = rows
      .map((r) => {
        const c = r.course;
        if (!c) return null;

        // pick translation by languageId أو أول واحدة كـ fallback
        const tr =
          c.translations?.find(
            (t: any) =>
              t?.language?.id === languageId || t?.languageId === languageId,
          ) || c.translations?.[0];

        return {
          id: c.id,
          image: c.image ?? null,
          name: tr?.name ?? '',
          description: tr?.description ?? '',
          contentsCount: countMap.get(c.id) ?? 0,
          totalDuration: durationMap.get(c.id) ?? 0,
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) => (orderIndex.get(a!.id) ?? 0) - (orderIndex.get(b!.id) ?? 0),
      ) as Array<{
      id: number;
      image: string | null;
      name: string;
      description: string;
      contentsCount: number;
      totalDuration: number;
    }>;

    return {
      data,
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
