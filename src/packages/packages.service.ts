// src/packages/packages.service.ts
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Package } from './entities/package.entity';
import { PackageTranslation } from './entities/package-translation.entity';
import { Language } from 'src/languages/entities/language.entity';

import { CreatePackageDto, PackageTranslationDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Content } from 'src/contents/entities/content.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { SavedPackage } from 'src/saved-packages/entities/saved-package.entity';
function pickTranslation<T extends { language?: { id?: number } }>(
  list: T[] | undefined,
  languageId?: number,
): T | undefined {
  if (!list || !list.length) return undefined;
  if (languageId == null) return list[0];
  return list.find((t) => (t as any)?.language?.id === languageId) ?? list[0];
}

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package) private readonly pkgRepo: Repository<Package>,
    @InjectRepository(PackageTranslation) private readonly trRepo: Repository<PackageTranslation>,
    @InjectRepository(Language) private readonly langRepo: Repository<Language>,
    @InjectRepository(Content) private readonly contentRepo: Repository<Content>,
    @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(LessonProgress) private readonly progressRepo: Repository<LessonProgress>,
    @InjectRepository(SavedPackage) private readonly savedPackage: Repository<SavedPackage>,

  ) {}

  /** helper: upsert translations (replace per language) */
  private async upsertTranslations(pkg: Package, translations: PackageTranslationDto[]) {
    for (const t of translations) {
      const lang = await this.langRepo.findOne({ where: { id: t.languageId } });
      if (!lang) throw new NotFoundException(`Language ${t.languageId} not found`);

      const existing = await this.trRepo.findOne({
        where: { package: { id: pkg.id }, language: { id: t.languageId } },
      });

      if (existing) {
        existing.title = t.title;
        existing.description = t.description ?? existing.description;
        existing.learning_outcoms = t.learning_outcoms ?? existing.learning_outcoms;
        await this.trRepo.save(existing);
      } else {
        const tr = this.trRepo.create({
          title: t.title,
          description: t.description,
          learning_outcoms: t.learning_outcoms,
          language: lang,
          package: pkg,
        });
        await this.trRepo.save(tr);
      }
    }
  }

  /** CREATE */
  async create(dto: CreatePackageDto) {
    const pkg = this.pkgRepo.create({
      image: dto.image ?? undefined,
      is_active: dto.is_active ?? 1,
      created_by: dto.created_by ?? undefined,
    });
    const saved = await this.pkgRepo.save(pkg);
    await this.upsertTranslations(saved, dto.translations);
    return this.findOne(saved.id);
  }

  /** FIND ALL (supports languageId to pick the right translation) */
  async findAll(languageId?: number) {
    const rows = await this.pkgRepo.find({
      relations: ['translations', 'translations.language'],
      order: { id: 'DESC' },
    });

    return rows.map((p) => {
      const tr =
        p.translations?.find((t) => t.language?.id === languageId) ||
        p.translations?.[0];

      return {
        id: p.id,
        image: p.image,
        is_active: p.is_active,
        title: tr?.title ?? '',
        description: tr?.description ?? '',
        learning_outcoms: tr?.learning_outcoms ?? '',
      };
    });
  }
  async packagesNav(languageId?: number) {
    const rows = await this.pkgRepo.find({
      relations: ['translations', 'translations.language'],
      order: { id: 'DESC' },
    })
    return rows.map((p) => {
      const tr = 
        p.translations?.find((t) => t.language?.id === languageId) || 
        p.translations?.[0];
        return {
          id: p.id,
          title: tr?.title ?? '',
          image: p.image,
        }
    })
  }
  

  /** FIND ONE */
  async findOne(id: number, languageId?: number) {
    const p = await this.pkgRepo.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });
    if (!p) throw new NotFoundException(`Package ${id} not found`);

    const tr =
      p.translations?.find((t) => t.language?.id === languageId) ||
      p.translations?.[0];

    return {
      id: p.id,
      image: p.image,
      is_active: p.is_active,
      title: tr?.title ?? '',
      description: tr?.description ?? '',
      learning_outcoms: tr?.learning_outcoms ?? '',
      translations: p.translations?.map((t) => ({
        id: t.id,
        languageId: t.language?.id,
        title: t.title,
        description: t.description,
        learning_outcoms: t.learning_outcoms,
      })) ?? [],
    };
  }

  /** UPDATE (fields + upsert translations if provided) */
  async update(id: number, dto: UpdatePackageDto) {
    const pkg = await this.pkgRepo.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException(`Package ${id} not found`);

    if (dto.image !== undefined) pkg.image = dto.image;
    if (dto.is_active !== undefined) {
      if (![0, 1].includes(dto.is_active)) {
        throw new BadRequestException('is_active must be 0 or 1');
      }
      pkg.is_active = dto.is_active;
    }

    await this.pkgRepo.save(pkg);

    if (dto.translations?.length) {
      await this.upsertTranslations(pkg, dto.translations);
    }

    return this.findOne(id);
  }

  /** SOFT DELETE */
  async remove(id: number) {
    const pkg = await this.pkgRepo.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException(`Package ${id} not found`);
    await this.pkgRepo.softDelete(id);
    return { message: `Package ${id} deleted successfully` };
  }

  /** RESTORE (اختياري) */
  async restore(id: number) {
    await this.pkgRepo.restore(id);
    return { message: `Package ${id} restored successfully` };
  }

  /** أول 8 باكيدجز */
/** أول 8 باكيدجز */
async findPackagesFirst8(languageId?: number) {
  const rows = await this.pkgRepo
    .createQueryBuilder('p')
    .leftJoin(
      'package_content',
      'pc',
      'pc.package_Id = p.id AND pc.deleted_at IS NULL AND pc.is_active != 0',
    )
    .leftJoin('content', 'c', 'c.id = pc.content_Id AND c.deleted_at IS NULL')
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
    .select('p.id', 'id')
    .addSelect('COUNT(DISTINCT c.id)', 'contentsCount')
    .addSelect('COALESCE(SUM(l.duration), 0)', 'totalDuration')
    .groupBy('p.id')
    .orderBy('p.id', 'DESC')
    .limit(8)
    .getRawMany<{ id: string; contentsCount: string; totalDuration: string }>();

  if (!rows.length) return [];

  const ids = rows.map((r) => Number(r.id));
  const countMap = new Map<number, number>(
    rows.map((r) => [Number(r.id), Number(r.contentsCount)]),
  );
  const durationMap = new Map<number, number>(
    rows.map((r) => [Number(r.id), Number(r.totalDuration)]),
  );

  const packs = await this.pkgRepo.find({
    where: { id: In(ids) },
    relations: ['translations', 'translations.language'],
  });

  const orderIndex = new Map<number, number>(ids.map((id, i) => [id, i]));
  packs.sort(
    (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
  );

  return packs.map((p) => {
    const tr =
      p.translations?.find((t) => t.language?.id === languageId) ||
      p.translations?.[0] ||
      null;

    return {
      id: p.id,
      image: p.image,
      title: tr?.title ?? '',
      description: tr?.description ?? '',
      contentsCount: countMap.get(p.id) ?? 0,
      totalDuration: durationMap.get(p.id) ?? 0, // ⏱️ إجمالي الثواني الخام
    };
  });
}

/** باكيدجز بباجينيشن */
async findPackagesPaginated(
  languageId?: number,
  page: number = 1,
  limit: number = 8,
) {
  const offset = (page - 1) * limit;

  const totalRow = await this.pkgRepo
    .createQueryBuilder('p')
    .select('COUNT(p.id)', 'total')
    .getRawOne<{ total: string }>();
  const total = Number(totalRow?.total ?? 0);
  const totalPages = Math.ceil(total / limit);

  if (total === 0) {
    return {
      items: [],
      pagination: { page, limit, total, totalPages, hasNext: false, hasPrev: false },
    };
  }

  const pageRows = await this.pkgRepo
    .createQueryBuilder('p')
    .leftJoin(
      'package_content',
      'pc',
      'pc.package_id = p.id AND pc.deleted_at IS NULL AND pc.is_active != 0',
    )
    .leftJoin('content', 'c', 'c.id = pc.content_id AND c.deleted_at IS NULL')
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
    .select('p.id', 'id')
    .addSelect('COUNT(DISTINCT c.id)', 'contentsCount')
    .addSelect('COALESCE(SUM(l.duration), 0)', 'totalDuration')
    .groupBy('p.id')
    .orderBy('p.id', 'DESC')
    .offset(offset)
    .limit(limit)
    .getRawMany<{ id: string; contentsCount: string; totalDuration: string }>();

  if (!pageRows.length) {
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

  const ids = pageRows.map((r) => Number(r.id));
  const countMap = new Map<number, number>(
    pageRows.map((r) => [Number(r.id), Number(r.contentsCount)]),
  );
  const durationMap = new Map<number, number>(
    pageRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
  );

  const packs = await this.pkgRepo.find({
    where: { id: In(ids) },
    relations: ['translations', 'translations.language'],
  });

  const orderIndex = new Map<number, number>(ids.map((id, i) => [id, i]));
  packs.sort(
    (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
  );

  const items = packs.map((p) => {
    const tr =
      p.translations?.find((t) => t.language?.id === languageId) ||
      p.translations?.[0] ||
      null;

    return {
      id: p.id,
      image: p.image,
      title: tr?.title ?? '',
      description: tr?.description ?? '',
      contentsCount: countMap.get(p.id) ?? 0,
      totalDuration: durationMap.get(p.id) ?? 0, // ⏱️ إجمالي الثواني الخام
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
async getPackageBasicById(
  packageId: number,
  { languageId }: { languageId?: number } = {},
  userId?: number,
) {
  // هات الباكيدج + الترجمات
  const pkg = await this.pkgRepo.findOne({
    where: { id: packageId },
    relations: ['translations', 'translations.language'],
  });
  if (!pkg) throw new NotFoundException(`Package ${packageId} not found`);

  const tr =
    pkg.translations?.find((t) => t.language?.id === languageId) ??
    pkg.translations?.[0] ??
    null;

  // إجمالي عدد المحتويات + إجمالي الديوراشن عبر كل دروس كل المحتويات
  const agg = await this.pkgRepo
    .createQueryBuilder('p')
    .innerJoin(
      'package_content',
      'pc',
      'pc.package_id = p.id AND pc.deleted_at IS NULL AND pc.is_active != 0',
    )
    .innerJoin('content', 'c', 'c.id = pc.content_id AND c.deleted_at IS NULL')
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
    .where('p.id = :pid', { pid: packageId })
    .select('COUNT(DISTINCT c.id)', 'contentsCount')
    .addSelect('COALESCE(SUM(l.duration), 0)', 'totalDuration')
    .getRawOne<{ contentsCount: string; totalDuration: string }>();
    let isSaved = false;
    if (userId) {
      // لو TypeORM >= 0.3 يدعم getExists()
      const exists = await this.savedPackage
        .createQueryBuilder('s')
        .leftJoin('s.user', 'u')
        .leftJoin('s.package', 'p')
        .where('u.id = :uid', { uid: userId })
        .andWhere('p.id = :pid', { pid: pkg.id })
        .getExists(); // إن لم تتوفر، استخدم getCount()>0
      isSaved = exists;
    }

  return {
    id: pkg.id,
    image: pkg.image,
    is_active: pkg.is_active,
    title: tr?.title ?? '',
    description: tr?.description ?? '',
    learning_outcoms: tr?.learning_outcoms ?? '',
    contentsCount: Number(agg?.contentsCount ?? 0),
    totalDuration: Number(agg?.totalDuration ?? 0), // بالثواني
    isSaved,
  };
}
async getPackageContentsPaginated(
  packageId: number,
  {
    page = 1,
    limit = 8,
    languageId,
    userId, // لإظهار isEnrolled + completedLessons
  }: {
    page?: number;
    limit?: number;
    languageId?: number;
    userId?: number;
  } = {},
) {
  const offset = (page - 1) * limit;

  // 1) IDs للمحتويات + إجمالي العدد
  const baseQb = this.pkgRepo
    .createQueryBuilder('p')
    .innerJoin(
      'package_content',
      'pc',
      'pc.package_id = p.id AND pc.deleted_at IS NULL AND pc.is_active != 0',
    )
    .innerJoin('content', 'c', 'c.id = pc.content_id AND c.deleted_at IS NULL')
    .where('p.id = :pid', { pid: packageId })
    .select('c.id', 'id')
    .groupBy('c.id');

  const allIdsRows = await baseQb.getRawMany<{ id: number }>();
  const total = allIdsRows.length;

  const pageIdsRows = await baseQb
    .orderBy('MIN(pc.order_no)', 'ASC') // لو عندك ترتيب داخل الباكيدج
    .offset(offset)
    .limit(limit)
    .getRawMany<{ id: number }>();

  const contentIds = pageIdsRows.map((r) => Number(r.id));

  if (!contentIds.length) {
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

  // 2) تفاصيل المحتوى + ترجمات + كاتيجوري
  const contents = await this.contentRepo
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
    .where('c.id IN (:...ids)', { ids: contentIds })
    .getMany();

  // 3) totalDuration + ratersCount لكل محتوى
  const statRows = await this.contentRepo
    .createQueryBuilder('c')
    .leftJoin('c.topics', 't', 't.deleted_at IS NULL AND t.is_active != 0')
    .leftJoin('t.lessons', 'l', 'l.deleted_at IS NULL AND l.is_active != 0')
    .leftJoin('c.enrollments', 'e')
    .select('c.id', 'id')
    .addSelect('COALESCE(SUM(l.duration), 0)', 'totalDuration')
    .addSelect('SUM(CASE WHEN e.rating > 0 THEN 1 ELSE 0 END)', 'ratersCount')
    .where('c.id IN (:...ids)', { ids: contentIds })
    .groupBy('c.id')
    .getRawMany<{ id: string; totalDuration: string; ratersCount: string }>();

  const durationMap = new Map<number, number>(
    statRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
  );
  const ratersMap = new Map<number, number>(
    statRows.map((r) => [Number(r.id), Number(r.ratersCount)]),
  );

  // 4) إجمالي عدد الدروس (active) لكل محتوى
  const lessonsCountRows = await this.contentRepo
    .createQueryBuilder('c')
    .leftJoin('c.topics', 't', 't.deleted_at IS NULL AND t.is_active != 0')
    .leftJoin('t.lessons', 'l', 'l.deleted_at IS NULL AND l.is_active != 0')
    .select('c.id', 'id')
    .addSelect('COUNT(DISTINCT l.id)', 'totalLessons')
    .where('c.id IN (:...ids)', { ids: contentIds })
    .groupBy('c.id')
    .getRawMany<{ id: string; totalLessons: string }>();

  const totalLessonsMap = new Map<number, number>(
    lessonsCountRows.map((r) => [Number(r.id), Number(r.totalLessons || 0)]),
  );

  // 5) الدروس المكتملة لكل محتوى للمستخدم (لو userId موجود)
  let completedLessonsMap = new Map<number, number>();
  if (userId) {
    // الأضمن: progress -> enrollment -> content
    const completedRows = await this.progressRepo
      .createQueryBuilder('lp')
      .innerJoin('lp.enrollment', 'en')
      .innerJoin('en.content', 'c')
      .where('lp.user_id = :uid', { uid: userId })
      .andWhere('lp.deleted_at IS NULL')
      .andWhere('c.id IN (:...ids)', { ids: contentIds })
      .select('c.id', 'id')
      .addSelect('COUNT(DISTINCT lp.lesson_id)', 'completedLessons')
      .groupBy('c.id')
      .getRawMany<{ id: string; completedLessons: string }>();

    completedLessonsMap = new Map<number, number>(
      completedRows.map((r) => [Number(r.id), Number(r.completedLessons || 0)]),
    );
  }

  // 6) isEnrolled لكل محتوى (اختياري)
  let enrolledMap = new Map<number, boolean>();
  if (userId) {
    const enrRows = await this.enrollmentRepo
      .createQueryBuilder('en')
      .select(['en.contentId AS cid'])
      .where('en.userId = :uid', { uid: userId })
      .andWhere('en.contentId IN (:...ids)', { ids: contentIds })
      .getRawMany<{ cid: number }>();
    enrolledMap = new Map(enrRows.map((r) => [Number(r.cid), true]));
  }

  // 7) حافظ على ترتيب IDs
  const orderIndex = new Map<number, number>(
    contentIds.map((id, i) => [id, i]),
  );
  contents.sort((a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0));

  // 8) شكّل العناصر بنفس شكل الكارد
  const items = contents.map((c) => {
    const tr = pickTranslation<{
      language?: { id: number };
      name?: string;
      description?: string;
      what_to_learn?: string;
    }>(c.translations, languageId);

    const catTr = pickTranslation<{ language?: { id: number }; name?: string }>(
      c.contentCategory?.translations,
      languageId,
    );

    const base = {
      id: c.id,
      name: tr?.name ?? '',
      description: tr?.description ?? '',
      image: c.image ?? null,
      level: c.level,
      rate: c.rate ?? 0,
      ratersCount: ratersMap.get(c.id) ?? 0,
      totalDuration: durationMap.get(c.id) ?? 0,
      whatToLearn: tr?.what_to_learn?.split(',') ?? [],
      category: { id: c.contentCategory?.id ?? null, name: catTr?.name ?? '' },
      created_at: c.created_at,
      totalLessons: totalLessonsMap.get(c.id) ?? 0,
      completedLessons: userId ? completedLessonsMap.get(c.id) ?? 0 : 0,
    };

    return userId ? { ...base, isEnrolled: enrolledMap.get(c.id) ?? false } : base;
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
