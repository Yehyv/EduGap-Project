// src/educator-reviews/educator-reviews.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EducatorReview } from './entities/educator-review.entity';
import { CreateEducatorReviewDto } from './dto/create-educator-review.dto';
import { UpdateEducatorReviewDto } from './dto/update-educator-review.dto';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { Content } from 'src/contents/entities/content.entity';
import { Educator } from 'src/educators/entities/educator.entity';

@Injectable()
export class EducatorReviewsService {
  constructor(
    @InjectRepository(EducatorReview)
    private readonly repo: Repository<EducatorReview>,
    @InjectRepository(Enrollment)
    private readonly enrRepo: Repository<Enrollment>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(Educator)
    private readonly educatorRepo: Repository<Educator>,
  ) {}

  /** ✅ الأهلية: لازم المحتوى تابع لنفس المدرّس + الـenrollment للمستخدم مكتمل (status = 1). */
  private async ensureEligibility(
    userId: number,
    educatorId: number,
    contentId: number,
  ) {
    const content = await this.contentRepo.findOne({
      where: { id: contentId },
      relations: ['educator'],
    });
    if (!content) throw new NotFoundException('Content not found');
    if (!content.educator || content.educator.id !== educatorId) {
      throw new ForbiddenException('Educator does not own this content');
    }

    // ✅ لازم يكون مكمّل المحتوى (status = 1)
    const enr = await this.enrRepo.findOne({
      where: { user: { id: userId }, content: { id: contentId }, status: 1 },
      select: ['id', 'status'],
    });
    if (!enr) {
      throw new ForbiddenException(
        'You must complete this content before rating its educator',
      );
    }
  }

  /** إنشاء أو تحديث (upsert) تقييم المدرّس */
  async upsert(userId: number, dto: CreateEducatorReviewDto) {
    await this.ensureEligibility(userId, dto.educatorId, dto.contentId);

    // تنظيف وحماية بسيطة
    const rating = Math.max(1, Math.min(5, Number(dto.rating))); // clamp
    const review = (dto.review?.trim() || null)?.slice(0, 2000) ?? null; // قص لأقصى 2000 حرف

    return await this.repo.manager.transaction(async (em) => {
      // قفل تفاؤلي بسيط لتفادي السباق
      let row = await em.findOne(EducatorReview, {
        where: {
          userId,
          educatorId: dto.educatorId,
          contentId: dto.contentId,
        },
        lock: { mode: 'pessimistic_write' }, // يتطلب InnoDB/PG
      });

      if (row) {
        row.rating = rating;
        row.review = review ?? row.review ?? null;
        row.updatedAt = new Date();
        await em.save(row);
        await this.recomputeEducatorAggregate(dto.educatorId);
        return row;
      }

      row = em.create(EducatorReview, {
        userId,
        educatorId: dto.educatorId,
        contentId: dto.contentId,
        rating,
        review,
      });
      await em.save(row);
      await this.recomputeEducatorAggregate(dto.educatorId);
      return row;
    });
  }

  /** تحديث مراجعة/تقييم */
  async update(userId: number, id: number, dto: UpdateEducatorReviewDto) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Review not found');
    if (row.userId !== userId) throw new ForbiddenException();

    if (dto.educatorId && dto.educatorId !== row.educatorId) {
      throw new BadRequestException('Cannot change educatorId');
    }
    if (dto.contentId && dto.contentId !== row.contentId) {
      throw new BadRequestException('Cannot change contentId');
    }

    if (dto.rating !== undefined) row.rating = dto.rating; // ✅ rating
    if (dto.review !== undefined) row.review = dto.review ?? null;

    await this.repo.save(row);
    await this.recomputeEducatorAggregate(row.educatorId);
    return row;
  }

  /** حذف تقييم */
  async remove(userId: number, id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException();
    if (row.userId !== userId) throw new ForbiddenException();
    await this.repo.remove(row);
    await this.recomputeEducatorAggregate(row.educatorId);
    return { message: 'Deleted' };
  }

  /** متوسط وعداد المقيمين → تحديث حقول في جدول Educator (كاش) */
  private async recomputeEducatorAggregate(educatorId: number) {
    const { avg, cnt } = (await this.repo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'cnt')
      .where('r.educatorId = :eid', { eid: educatorId })
      .getRawOne<{ avg: string | null; cnt: string }>()) ?? {
      avg: null,
      cnt: '0',
    };

    const educator = await this.educatorRepo.findOne({
      where: { id: educatorId },
    });
    if (!educator) return;

    (educator as any).avg_rate = avg ? Number(Number(avg).toFixed(2)) : 0;
    (educator as any).raters_count = Number(cnt ?? 0);
    await this.educatorRepo.save(educator);
  }

  /** عرض تقييمات المدرّس (باجينيشن) */
  async listForEducator(educatorId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [rows, total] = await this.repo.findAndCount({
      where: { educatorId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return {
      items: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }
}
