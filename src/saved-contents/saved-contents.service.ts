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
  private async syncContentRates(contentIds: number[]) {
    if (!contentIds.length) return;

    const avgRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.enrollments', 'e')
      .select('c.id', 'id')
      .addSelect(
        `
      CASE
        WHEN SUM(CASE WHEN e.rating > 0 THEN 1 ELSE 0 END) = 0
        THEN 0
        ELSE ROUND(
          SUM(CASE WHEN e.rating > 0 THEN e.rating ELSE 0 END)
          / SUM(CASE WHEN e.rating > 0 THEN 1 ELSE 0 END), 2
        )
      END
      `,
        'avg',
      )
      .where('c.id IN (:...ids)', { ids: contentIds })
      .groupBy('c.id')
      .getRawMany<{ id: string; avg: string }>();

    for (const r of avgRows) {
      await this.contentRepo.update(
        { id: Number(r.id) },
        { rate: Number(r.avg) },
      );
    }
  }

  private async getDurationMap(contentIds: number[]) {
    const durationRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.topics', 't')
      .leftJoin('t.lessons', 'l')
      .select('c.id', 'id')
      .addSelect('COALESCE(SUM(l.duration), 0)', 'totalDuration')
      .where('c.id IN (:...ids)', { ids: contentIds })
      .groupBy('c.id')
      .getRawMany<{ id: string; totalDuration: string }>();

    return new Map<number, number>(
      durationRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
    );
  }

  private async getRatersMap(contentIds: number[]) {
    const ratingCountRows = await this.enrollmentRepo
      .createQueryBuilder('e')
      .select('e.contentId', 'id')
      .addSelect('COUNT(*)', 'ratersCount')
      .where('e.contentId IN (:...ids)', { ids: contentIds })
      .andWhere('e.rating > 0')
      .groupBy('e.contentId')
      .getRawMany<{ id: string; ratersCount: string }>();

    return new Map<number, number>(
      ratingCountRows.map((r) => [Number(r.id), Number(r.ratersCount)]),
    );
  }

  private async getUserEnrolledMap(userId: number, contentIds: number[]) {
    const enrRows = await this.enrollmentRepo
      .createQueryBuilder('en')
      .select('en.contentId', 'cid')
      .where('en.userId = :uid', { uid: userId })
      .andWhere('en.contentId IN (:...ids)', { ids: contentIds })
      .getRawMany<{ cid: string }>();

    return new Map<number, boolean>(enrRows.map((r) => [Number(r.cid), true]));
  }
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
    const rawPage = Number(opts?.page);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

    const rawLimit = Number(opts?.limit);
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, rawLimit) : 20;

    const languageId = opts?.languageId;

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
      .where('u.id = :userId', { userId })
      .andWhere('c.deleted_at IS NULL')
      .orderBy('s.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .distinct(true);

    if (opts?.search?.trim()) {
      const q = `%${opts.search.trim()}%`;
      qb.andWhere('(tr.name ILIKE :q OR tr.description ILIKE :q)', { q });
    }

    const countQb = this.savedRepo
      .createQueryBuilder('s')
      .leftJoin('s.user', 'u')
      .leftJoin('s.content', 'c')
      .leftJoin('c.translations', 'trCount')
      .where('u.id = :userId', { userId })
      .andWhere('c.deleted_at IS NULL');

    if (opts?.search?.trim()) {
      const q = `%${opts.search.trim()}%`;
      countQb.andWhere(
        '(trCount.name ILIKE :q OR trCount.description ILIKE :q)',
        { q },
      );
    }

    const result = await countQb
      .select('COUNT(DISTINCT s.id)', 'cnt')
      .getRawOne<{ cnt: string | number }>();

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
    const contentIds = rows.map((r) => r.content?.id).filter(Boolean);

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

    const countRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.enrollments', 'e')
      .select('c.id', 'id')
      .addSelect('COUNT(e.id)', 'cnt')
      .where('c.id IN (:...ids)', { ids: contentIds })
      .groupBy('c.id')
      .getRawMany<{ id: string; cnt: string }>();

    const enrollmentsCountMap = new Map<number, number>(
      countRows.map((r) => [Number(r.id), Number(r.cnt)]),
    );

    const avgRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.enrollments', 'e')
      .select('c.id', 'id')
      .addSelect(
        `
      CASE
        WHEN SUM(CASE WHEN e.rating > 0 THEN 1 ELSE 0 END) = 0
        THEN 0
        ELSE ROUND(
          SUM(CASE WHEN e.rating > 0 THEN e.rating ELSE 0 END)
          / SUM(CASE WHEN e.rating > 0 THEN 1 ELSE 0 END), 2
        )
      END
      `,
        'avg',
      )
      .where('c.id IN (:...ids)', { ids: contentIds })
      .groupBy('c.id')
      .getRawMany<{ id: string; avg: string }>();

    const rateMap = new Map<number, number>(
      avgRows.map((r) => [Number(r.id), Number(r.avg)]),
    );

    const durationRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.topics', 't')
      .leftJoin('t.lessons', 'l')
      .select('c.id', 'id')
      .addSelect('COALESCE(SUM(l.duration), 0)', 'totalDuration')
      .where('c.id IN (:...ids)', { ids: contentIds })
      .groupBy('c.id')
      .getRawMany<{ id: string; totalDuration: string }>();

    const durationMap = new Map<number, number>(
      durationRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
    );

    const ratingCountRows = await this.enrollmentRepo
      .createQueryBuilder('e')
      .select('e.contentId', 'id')
      .addSelect('COUNT(*)', 'ratersCount')
      .where('e.contentId IN (:...ids)', { ids: contentIds })
      .andWhere('e.rating > 0')
      .groupBy('e.contentId')
      .getRawMany<{ id: string; ratersCount: string }>();

    const ratersMap = new Map<number, number>(
      ratingCountRows.map((r) => [Number(r.id), Number(r.ratersCount)]),
    );

    const enrRows = await this.enrollmentRepo
      .createQueryBuilder('en')
      .select('en.contentId', 'cid')
      .where('en.userId = :uid', { uid: userId })
      .andWhere('en.contentId IN (:...ids)', { ids: contentIds })
      .getRawMany<{ cid: string }>();

    const enrolledMap = new Map<number, boolean>(
      enrRows.map((r) => [Number(r.cid), true]),
    );

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
        rate: rateMap.get(c.id) ?? c.rate ?? 0,
        ratersCount: ratersMap.get(c.id) ?? 0,
        totalDuration: durationMap.get(c.id) ?? 0,
        isEnrolled: enrolledMap.get(c.id) ?? false,
        isSaved: true,
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
