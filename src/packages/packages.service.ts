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
@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package) private readonly pkgRepo: Repository<Package>,
    @InjectRepository(PackageTranslation) private readonly trRepo: Repository<PackageTranslation>,
    @InjectRepository(Language) private readonly langRepo: Repository<Language>,
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
      'pc.package_id = p.id AND pc.deleted_at IS NULL AND pc.is_active != 0',
    )
    .leftJoin('content', 'c', 'c.id = pc.content_id AND c.deleted_at IS NULL')
    .leftJoin(
      'topic',
      't',
      't.content_id = c.id AND t.deleted_at IS NULL AND t.is_active != 0',
    )
    .leftJoin(
      'lesson',
      'l',
      'l.topic_id = t.id AND l.deleted_at IS NULL AND l.is_active != 0',
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


}
