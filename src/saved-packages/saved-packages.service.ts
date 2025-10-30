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
    opts?: { page?: number; limit?: number; search?: string },
  ): Promise<{
    data: Array<{ savedId: number; savedAt: Date; package: Package }>;
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
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.package', 'pkg')
      .leftJoin('sp.user', 'u')
      .where('u.id = :userId', { userId });

    // بحث على ترجمات الباكدج (لو عندك title/short_title داخل PackageTranslation)
    if (opts?.search?.trim()) {
      qb.leftJoin('pkg.translations', 't')
        // PostgreSQL: ILIKE — لو MySQL استخدم LOWER(..) LIKE LOWER(:q)
        .andWhere('(t.title ILIKE :q OR t.short_title ILIKE :q)', {
          q: `%${opts.search.trim()}%`,
        })
        .distinct(true);
    }

    qb.orderBy('sp.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    // عدّ منفصل لتجنب مشاكل getManyAndCount مع distinct/joins
    const countQb = qb
      .clone()
      .select('COUNT(DISTINCT sp.id)', 'cnt')
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
        package: r.package,
      })),
      page,
      limit,
      total,
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
