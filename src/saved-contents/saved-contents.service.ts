import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedContent } from './entities/saved-content.entity';
import { Content } from 'src/contents/entities/content.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SavedContentsService {
  constructor(
    @InjectRepository(SavedContent)
    private readonly savedRepo: Repository<SavedContent>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
    opts?: { page?: number; limit?: number; search?: string },
  ): Promise<{
    data: Array<{ savedId: number; savedAt: Date; content: Content }>;
    page: number;
    limit: number;
    total: number;
  }> {
    // sanitize
    const rawPage = Number(opts?.page);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

    const rawLimit = Number(opts?.limit);
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, rawLimit) : 20;

    const qb = this.savedRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.content', 'content')
      .leftJoin('s.user', 'u')
      .where('u.id = :userId', { userId });

    // بحث في الترجمات (لو عندك ContentTranslation بعناوين)
    if (opts?.search?.trim()) {
      qb.leftJoin('content.translations', 't')
        // PostgreSQL: ILIKE — لو MySQL استخدم LOWER(... ) LIKE LOWER(:q)
        .andWhere('(t.title ILIKE :q OR t.short_title ILIKE :q)', {
          q: `%${opts.search.trim()}%`,
        })
        .distinct(true);
    }

    qb.orderBy('s.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    // عدّ منفصل لتجنّب مشاكل getManyAndCount مع distinct/joins
    const countQb = qb
      .clone()
      .select('COUNT(DISTINCT s.id)', 'cnt')
      .orderBy()
      .limit(undefined)
      .offset(undefined);

    const result: { cnt: string | number } | undefined =
      await countQb.getRawOne();
    const total = Number(result?.cnt ?? 0);

    const rows = await qb.getMany();

    return {
      data: rows.map((r) => ({
        savedId: r.id,
        savedAt: r.createdAt,
        content: r.content,
      })),
      page,
      limit,
      total,
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
