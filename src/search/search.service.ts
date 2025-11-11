import { Injectable } from '@nestjs/common';
import { CreateSearchDto } from './dto/create-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Content } from 'src/contents/entities/content.entity';
import { Repository } from 'typeorm';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
type SearchContentItem = {
  id: number;
  name: string;
  description: string;
  image: string | null;
  level: string;
  rate: number;
  ratersCount: number;
  totalDuration: number;
  whatToLearn: string[];
  category: {
    id: number | null;
    name: string;
  };
  created_at: Date;
  isEnrolled?: boolean;
};
@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}
  private pickTranslation<T extends { language?: { id?: number } }>(
    list: T[] | undefined,
    languageId?: number,
  ): T | undefined {
    if (!list || !list.length) return undefined;
    if (languageId == null) return list[0];
    return (
      list.find(
        (t: any) =>
          t?.language?.id === languageId || t?.languageId === languageId,
      ) ?? list[0]
    );
  }

  /**
   * searchContents
   * يعمل سيرش على:
   *  - اسم المحتوى أو description (translations)
   *  - اسم الكاتيجوري (category translation)
   *
   * params:
   *  q: string (search text)
   *  languageId?: number (لإختيار الترجمة)
   *  categoryId?: number (فلتر كاتيجوري معيّن بالـ id)
   *  userId?: number (عشان isEnrolled)
   *  page/limit: pagination
   */
  async searchContents(
    q: string,
    {
      page = 1,
      limit = 8,
      languageId,
      categoryId,
      userId,
    }: {
      page?: number;
      limit?: number;
      languageId?: number;
      categoryId?: number;
      userId?: number;
    } = {},
  ) {
    const skip = (page - 1) * limit;
    const search = q?.trim();

    const qb = this.contentRepo
      .createQueryBuilder('c')
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
      .where('c.deleted_at IS NULL')
      .andWhere('c.is_active != 0');

    // 🔍 فلتر نص السيرش (اسم المحتوى / description / اسم الكاتيجوري)
    if (search) {
      const term = `%${search.toLowerCase()}%`;

      // ✅ شغال على MySQL (و PostgreSQL كمان)
      qb.andWhere(
        `(
        LOWER(tr.name) LIKE :term
        OR LOWER(tr.description) LIKE :term
        OR LOWER(catTr.name) LIKE :term
      )`,
        { term },
      );
    }

    // فلتر كاتيجوري بالـ id (اختياري)
    if (categoryId) {
      qb.andWhere('cat.id = :categoryId', { categoryId });
    }

    qb.orderBy('c.created_at', 'DESC').skip(skip).take(limit);

    const [rows, total] = await qb.getManyAndCount();

    if (!rows.length) {
      const totalPages = Math.ceil(total / limit);
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

    const ids = rows.map((c) => c.id);

    // 2) totalDuration + ratersCount
    const statsRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.topics', 't')
      .leftJoin('t.lessons', 'l')
      .leftJoin('c.enrollments', 'e')
      .select('c.id', 'id')
      .addSelect('COALESCE(SUM(l.duration), 0)', 'totalDuration')
      .addSelect('SUM(CASE WHEN e.rating > 0 THEN 1 ELSE 0 END)', 'ratersCount')
      .where('c.id IN (:...ids)', { ids })
      .groupBy('c.id')
      .getRawMany<{ id: string; totalDuration: string; ratersCount: string }>();

    const durationMap = new Map<number, number>(
      statsRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
    );
    const ratersMap = new Map<number, number>(
      statsRows.map((r) => [Number(r.id), Number(r.ratersCount)]),
    );

    // 3) isEnrolled لو userId موجود
    let enrolledMap = new Map<number, boolean>();
    if (userId) {
      const enrRows = await this.enrollmentRepo
        .createQueryBuilder('en')
        .select(['en.contentId AS cid'])
        .where('en.userId = :uid', { uid: userId })
        .andWhere('en.contentId IN (:...ids)', { ids })
        .getRawMany<{ cid: number }>();

      enrolledMap = new Map(enrRows.map((r) => [Number(r.cid), true]));
    }

    // 4) جهّز الـ items بنفس شكل الكارد
    const items: SearchContentItem[] = rows.map((c) => {
      const tr = this.pickTranslation(c.translations, languageId);
      const catTr = this.pickTranslation(
        c.contentCategory?.translations,
        languageId,
      );

      const base: SearchContentItem = {
        id: c.id,
        name: tr?.name ?? '',
        description: tr?.description ?? '',
        image: c.image,
        level: c.level,
        rate: c.rate ?? 0,
        ratersCount: ratersMap.get(c.id) ?? 0,
        totalDuration: durationMap.get(c.id) ?? 0,
        whatToLearn: tr?.what_to_learn?.split(',') ?? [],
        category: {
          id: c.contentCategory?.id ?? null,
          name: catTr?.name ?? '',
        },
        created_at: c.created_at,
      };

      return userId
        ? { ...base, isEnrolled: enrolledMap.get(c.id) ?? false }
        : base;
    });

    const totalPages = Math.ceil(total / limit);
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
}
