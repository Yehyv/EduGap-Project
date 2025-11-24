import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SavedContent } from './entities/saved-content.entity';
import { Content } from 'src/contents/entities/content.entity';
import { User } from 'src/users/entities/user.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';

@Injectable()
export class SavedContentsService {
  constructor(
    @InjectRepository(SavedContent)
    private readonly savedRepo: Repository<SavedContent>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  async save(userId: number, contentId: number): Promise<SavedContent> {
    const [user, content] = await Promise.all([
      this.userRepo.findOne({ where: { id: userId } }),
      this.contentRepo.findOne({ where: { id: contentId } }),
    ]);
    if (!user) throw new NotFoundException('User not found');
    if (!content) throw new NotFoundException('Content not found');

    // هل موجود قبل كده (حتى لو soft-deleted)؟
    const existing = await this.savedRepo
      .createQueryBuilder('s')
      .withDeleted()
      .leftJoin('s.user', 'u')
      .leftJoin('s.content', 'c')
      .where('u.id = :userId AND c.id = :contentId', { userId, contentId })
      .getOne();

    if (existing) {
      if (existing.deletedAt) {
        await this.savedRepo.restore(existing.id);
        existing.deletedAt = null;
      }
      return existing;
    }

    const created = this.savedRepo.create({ user, content });
    return this.savedRepo.save(created);
  }

  async unsave(userId: number, contentId: number): Promise<void> {
    const existing = await this.savedRepo
      .createQueryBuilder('s')
      .leftJoin('s.user', 'u')
      .leftJoin('s.content', 'c')
      .where('u.id = :userId AND c.id = :contentId', { userId, contentId })
      .getOne();

    if (!existing) return;
    await this.savedRepo.softDelete(existing.id);
  }

  async toggle(
    userId: number,
    contentId: number,
  ): Promise<{ isSaved: boolean }> {
    const isSaved = await this.isSaved(userId, contentId);
    if (isSaved) {
      await this.unsave(userId, contentId);
      return { isSaved: false };
    } else {
      await this.save(userId, contentId);
      return { isSaved: true };
    }
  }

  async isSaved(userId: number, contentId: number): Promise<boolean> {
    return this.savedRepo
      .createQueryBuilder('s')
      .leftJoin('s.user', 'u')
      .leftJoin('s.content', 'c')
      .where('u.id = :userId AND c.id = :contentId', { userId, contentId })
      .getExists();
  }

  async listUserSavedContents(
    userId: number,
    opts?: {
      page?: number;
      limit?: number;
      search?: string;
      languageId?: number;
    },
  ): Promise<{
    items: Array<{
      id: number;
      name: string;
      description: string;
      image: string | null;
      level: string;
      rate: number;
      ratersCount: number;
      totalDuration: number;
      isEnrolled: boolean;
      isSaved: boolean;
      educator: {
        id: number;
        title: string | null;
        name: string;
      } | null;
      whatToLearn: string[];
      category: { id: number | null; name: string };
      enrollmentsCount: number;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    // -------- sanitize page/limit ----------
    const rawPage = Number(opts?.page);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

    const rawLimit = Number(opts?.limit);
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, rawLimit) : 20;

    const languageId = opts?.languageId;

    // -------- base query على SavedContent ----------
    const qb = this.savedRepo
      .createQueryBuilder('s')
      .leftJoin('s.user', 'u')
      .leftJoinAndSelect('s.content', 'c')
      .leftJoinAndSelect(
        'c.translations',
        'tr',
        languageId ? 'tr.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('c.contentCategory', 'cat')
      .leftJoinAndSelect(
        'cat.translations',
        'catTr',
        languageId ? 'catTr.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('c.educator', 'educator')
      .leftJoinAndSelect('educator.user', 'eduUser')
      .where('u.id = :userId', { userId });

    // -------- search (على اسم المحتوى مثلاً) ----------
    if (opts?.search?.trim()) {
      const q = `%${opts.search.trim()}%`;
      qb.andWhere('(tr.name ILIKE :q OR tr.description ILIKE :q)', { q });
    }

    qb.orderBy('s.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .distinct(true);

    // ---- count منفصل لتجنب مشاكل distinct/joins ----
    const countQb = this.savedRepo
      .createQueryBuilder('s')
      .leftJoin('s.user', 'u')
      .leftJoin('s.content', 'c')
      .leftJoin('c.translations', 'trCount')
      .where('u.id = :userId', { userId });

    if (opts?.search?.trim()) {
      const q = `%${opts.search.trim()}%`;
      countQb.andWhere(
        '(trCount.name ILIKE :q OR trCount.description ILIKE :q)',
        { q },
      );
    }

    const result: { cnt: string | number } | undefined = await countQb
      .select('COUNT(DISTINCT s.id)', 'cnt')
      .getRawOne();
    const total = Number(result?.cnt ?? 0);
    const totalPages = Math.ceil(total / limit);

    if (total === 0) {
      return {
        items: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    const rows = await qb.getMany();

    // -------- IDs للـ contents المحفوظه ----------
    const contentIds = rows
      .map((r) => r.content?.id)
      .filter(Boolean) as number[];
    if (!contentIds.length) {
      return {
        items: [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    }

    // -------- enrollmentsCount لكل محتوى ----------
    const countRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.enrollments', 'e')
      .select('c.id', 'id')
      .addSelect('COUNT(e.id)', 'cnt')
      .where('c.id IN (:...ids)', { ids: contentIds })
      .groupBy('c.id')
      .getRawMany<{ id: number; cnt: string }>();

    const enrollmentsCountMap = new Map<number, number>(
      countRows.map((r) => [Number(r.id), Number(r.cnt)]),
    );

    // -------- متوسط التقييم وتحديث content.rate ----------
    const avgRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.enrollments', 'e2')
      .select('c.id', 'id')
      .addSelect(
        `
      CASE
        WHEN SUM(CASE WHEN e2.rating > 0 THEN 1 ELSE 0 END) = 0
        THEN 0
        ELSE ROUND(
          SUM(CASE WHEN e2.rating > 0 THEN e2.rating ELSE 0 END)
          / SUM(CASE WHEN e2.rating > 0 THEN 1 ELSE 0 END), 2
        )
      END
      `,
        'avg',
      )
      .where('c.id IN (:...ids)', { ids: contentIds })
      .groupBy('c.id')
      .getRawMany<{ id: number; avg: string }>();

    for (const r of avgRows) {
      await this.contentRepo.update(
        { id: Number(r.id) },
        { rate: Number(r.avg) },
      );
    }

    // -------- مدة المحتوى + عدد المقيمين ----------
    const statsRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.topics', 't')
      .leftJoin('t.lessons', 'l')
      .leftJoin('c.enrollments', 'e3')
      .select('c.id', 'id')
      .addSelect('COALESCE(SUM(l.duration), 0)', 'totalDuration')
      .addSelect(
        'SUM(CASE WHEN e3.rating > 0 THEN 1 ELSE 0 END)',
        'ratersCount',
      )
      .where('c.id IN (:...ids)', { ids: contentIds })
      .groupBy('c.id')
      .getRawMany<{ id: number; totalDuration: string; ratersCount: string }>();

    const durationMap = new Map<number, number>(
      statsRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
    );
    const ratersMap = new Map<number, number>(
      statsRows.map((r) => [Number(r.id), Number(r.ratersCount)]),
    );

    // -------- isEnrolled لليوزر الحالي ----------
    const enrRows = await this.enrollmentRepo
      .createQueryBuilder('en')
      .leftJoin('en.user', 'u')
      .leftJoin('en.content', 'c')
      .select('c.id', 'cid')
      .where('u.id = :uid', { uid: userId })
      .andWhere('c.id IN (:...ids)', { ids: contentIds })
      .getRawMany<{ cid: number }>();

    const enrolledMap = new Map<number, boolean>(
      enrRows.map((r) => [Number(r.cid), true]),
    );

    // -------- تكوين الـ items بنفس شكل findCompletedPaginatedForUser ----------
    const items = rows.map((r) => {
      const c = r.content;
      const tr =
        c.translations?.find(
          (t: any) =>
            t?.language?.id === languageId || t?.languageId === languageId,
        ) || c.translations?.[0];

      const catTr =
        c.contentCategory?.translations?.find(
          (t: any) =>
            t?.language?.id === languageId || t?.languageId === languageId,
        ) || c.contentCategory?.translations?.[0];

      return {
        id: c.id,
        name: tr?.name ?? '',
        description: tr?.description ?? '',
        image: c.image ?? null,
        level: c.level,

        rate: c.rate ?? 0,
        ratersCount: ratersMap.get(c.id) ?? 0,
        totalDuration: durationMap.get(c.id) ?? 0,
        isEnrolled: enrolledMap.get(c.id) ?? false,
        isSaved: true, // لأنه جاي من SavedContent

        educator: c.educator
          ? {
              id: c.educator.id,
              title: c.educator.title ?? null,
              name: c.educator.user?.full_name ?? '',
            }
          : null,

        whatToLearn: tr?.what_to_learn?.split(',') ?? [],
        category: {
          id: c.contentCategory?.id ?? null,
          name: catTr?.name ?? '',
        },
        enrollmentsCount: enrollmentsCountMap.get(c.id) ?? 0,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async clearUserSavedContents(userId: number): Promise<number> {
    const items = await this.savedRepo.find({
      where: { user: { id: userId } },
      select: ['id'],
    });
    if (!items.length) return 0;
    await this.savedRepo.softDelete(items.map((i) => i.id));
    return items.length;
  }
  async savedContentsNav(
    userId: number,
    {
      languageId,
      limit = 12, // مناسب للـ navbar
    }: { languageId?: number; limit?: number } = {},
  ): Promise<
    Array<{
      id: number;
      name: string;
      image: string | null;
      instructor: { id: number; name: string; title: string | null } | null;
    }>
  > {
    const qb = this.savedRepo
      .createQueryBuilder('s')
      .leftJoin('s.user', 'u')
      .leftJoinAndSelect('s.content', 'c')
      .leftJoinAndSelect(
        'c.translations',
        'tr',
        languageId ? 'tr.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('c.educator', 'edu')
      .leftJoinAndSelect('edu.user', 'eduUser')
      .where('u.id = :userId', { userId })
      .orderBy('s.createdAt', 'DESC')
      .take(limit)
      .distinct(true);

    const rows = await qb.getMany();

    const pickTr = <T extends { language?: { id?: number } }>(
      list: T[] | undefined,
      langId?: number,
    ): T | undefined => {
      if (!list || !list.length) return undefined;
      if (langId == null) return list[0];
      return (
        list.find(
          (t: any) => t?.language?.id === langId || t?.languageId === langId,
        ) ?? list[0]
      );
    };

    return rows.map((r) => {
      const tr = pickTr(r.content?.translations, languageId);
      const instructor = r.content?.educator
        ? {
            id: r.content.educator.id,
            name: r.content.educator.user?.full_name ?? '',
            title: r.content.educator.title ?? null,
          }
        : null;

      return {
        id: r.content.id,
        name: tr?.name ?? '',
        image: r.content.image ?? null,
        instructor,
        isSaved: true,
      };
    });
  }
}
