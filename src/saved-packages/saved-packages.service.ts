import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedPackage } from './entities/saved-package.entity';
import { Package } from 'src/packages/entities/package.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SavedPackagesService {
  constructor(
    @InjectRepository(SavedPackage)
    private readonly savedRepo: Repository<SavedPackage>,
    @InjectRepository(Package)
    private readonly packageRepo: Repository<Package>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Package)
    private readonly pkgRepo: Repository<Package>,
  ) {}

  async save(userId: number, packageId: number): Promise<SavedPackage> {
    const [user, pkg] = await Promise.all([
      this.userRepo.findOne({ where: { id: userId } }),
      this.packageRepo.findOne({ where: { id: packageId } }),
    ]);
    if (!user) throw new NotFoundException('User not found');
    if (!pkg) throw new NotFoundException('Package not found');

    // لو محفوظ قبل كده (حتى لو soft-deleted) نرجّعه
    const existing = await this.savedRepo
      .createQueryBuilder('sp')
      .withDeleted()
      .leftJoin('sp.user', 'u')
      .leftJoin('sp.package', 'p')
      .where('u.id = :userId AND p.id = :packageId', { userId, packageId })
      .getOne();

    if (existing) {
      if (existing.deletedAt) {
        await this.savedRepo.restore(existing.id);
        existing.deletedAt = null;
      }
      return existing;
    }

    const created = this.savedRepo.create({ user, package: pkg });
    return this.savedRepo.save(created);
  }

  async unsave(userId: number, packageId: number): Promise<void> {
    const existing = await this.savedRepo
      .createQueryBuilder('sp')
      .leftJoin('sp.user', 'u')
      .leftJoin('sp.package', 'p')
      .where('u.id = :userId AND p.id = :packageId', { userId, packageId })
      .getOne();

    if (!existing) return;
    await this.savedRepo.softDelete(existing.id);
  }

  async toggle(
    userId: number,
    packageId: number,
  ): Promise<{ isSaved: boolean }> {
    const isSaved = await this.isSaved(userId, packageId);
    if (isSaved) {
      await this.unsave(userId, packageId);
      return { isSaved: false };
    } else {
      await this.save(userId, packageId);
      return { isSaved: true };
    }
  }

  async isSaved(userId: number, packageId: number): Promise<boolean> {
    return this.savedRepo
      .createQueryBuilder('sp')
      .leftJoin('sp.user', 'u')
      .leftJoin('sp.package', 'p')
      .where('u.id = :userId AND p.id = :packageId', { userId, packageId })
      .getExists();
  }

  async listUserSavedPackages(
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
      image: string | null;
      title: string;
      description: string;
      contentsCount: number;
      totalDuration: number;
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
    // -------- sanitize page / limit --------
    const rawPage = Number(opts?.page);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

    const rawLimit = Number(opts?.limit);
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, rawLimit) : 20;

    const languageId = opts?.languageId;

    // -------- base query: SavedPackage + Package + Translations --------
    const qb = this.savedRepo
      .createQueryBuilder('sp')
      .leftJoin('sp.user', 'u')
      .leftJoinAndSelect('sp.package', 'pkg')
      .leftJoinAndSelect(
        'pkg.translations',
        'tr',
        languageId ? 'tr.languageId = :languageId' : undefined,
        { languageId },
      )
      .where('u.id = :userId', { userId });

    // 🔍 search على ترجمات الباكدج (title / description)
    if (opts?.search?.trim()) {
      const q = `%${opts.search.trim()}%`;
      qb.andWhere('(tr.title ILIKE :q OR tr.description ILIKE :q)', {
        q,
      }).distinct(true);
    }

    qb.orderBy('sp.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    // -------- count منفصل لتفادي مشاكل distinct/joins --------
    const countQb = this.savedRepo
      .createQueryBuilder('sp')
      .leftJoin('sp.user', 'u')
      .leftJoin('sp.package', 'pkg')
      .leftJoin('pkg.translations', 'trCount')
      .where('u.id = :userId', { userId });

    if (opts?.search?.trim()) {
      const q = `%${opts.search.trim()}%`;
      countQb.andWhere(
        '(trCount.title ILIKE :q OR trCount.description ILIKE :q)',
        { q },
      );
    }

    const result: { cnt: string | number } | undefined = await countQb
      .select('COUNT(DISTINCT sp.id)', 'cnt')
      .getRawOne();

    const total = Number(result?.cnt ?? 0);
    const totalPages = Math.ceil(total / limit);

    if (!total) {
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

    // IDs للباكدجات المحفوظة
    const packageIds = rows.map((r) => r.package?.id).filter(Boolean);

    if (!packageIds.length) {
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

    // -------- نفس لوجيك findPackagesPaginated للـ contentsCount + totalDuration --------
    const durRows = await this.pkgRepo
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
      .where('p.id IN (:...ids)', { ids: packageIds })
      .groupBy('p.id')
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

    // نحافظ على ترتيب السيف
    const orderIndex = new Map<number, number>(
      packageIds.map((id, i) => [id, i]),
    );

    const items = rows
      .map((r) => {
        const p = r.package;
        if (!p) return null;

        const tr =
          p.translations?.find(
            (t: any) =>
              t?.language?.id === languageId || t?.languageId === languageId,
          ) ||
          p.translations?.[0] ||
          null;

        return {
          id: p.id,
          image: p.image ?? null,
          title: tr?.title ?? '',
          description: tr?.description ?? '',
          contentsCount: countMap.get(p.id) ?? 0,
          totalDuration: durationMap.get(p.id) ?? 0,
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) => (orderIndex.get(a!.id) ?? 0) - (orderIndex.get(b!.id) ?? 0),
      ) as Array<{
      id: number;
      image: string | null;
      title: string;
      description: string;
      contentsCount: number;
      totalDuration: number;
    }>;

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

  async clearUserSavedPackages(userId: number): Promise<number> {
    const items = await this.savedRepo.find({
      where: { user: { id: userId } },
      select: ['id'],
    });
    if (!items.length) return 0;
    await this.savedRepo.softDelete(items.map((i) => i.id));
    return items.length;
  }
}
