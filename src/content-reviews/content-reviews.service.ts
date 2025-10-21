/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ContentReview } from './entities/content-review.entity';
import { CreateContentReviewDto } from './dto/create-content-review.dto';
import { UpdateContentReviewDto } from './dto/update-content-review.dto';

import { User } from 'src/users/entities/user.entity';
import { Content } from 'src/contents/entities/content.entity';
import { CourseContent } from 'src/courses/entities/course-content.entity';
import { InstituteProgramCourse } from 'src/institutes/entities/institute-program-course.entity';

@Injectable()
export class ContentReviewsService {
  constructor(
    @InjectRepository(ContentReview)
    private readonly reviewRepo: Repository<ContentReview>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(CourseContent)
    private readonly courseContentRepo: Repository<CourseContent>,
    @InjectRepository(InstituteProgramCourse)
    private readonly ipcRepo: Repository<InstituteProgramCourse>,
  ) {}

  /**
   * إنشاء ريفيو لمحتوى (مع عزل المعهد عبر IPC)
   */
  async create(
    contentId: number,
    userId: number,
    userInstituteId: number,
    dto: CreateContentReviewDto,
  ) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const content = await this.contentRepo.findOne({ where: { id: contentId } });
    if (!content) throw new NotFoundException(`Content ${contentId} not found`);

    // تأكد أن المحتوى مرتبط بكورس تابع لمعهد المستخدم عبر IPC
    const courseLinks = await this.courseContentRepo.find({
      where: { content: { id: contentId } },
      relations: ['course'],
    });
    if (!courseLinks.length) {
      throw new ForbiddenException('Content is not linked to any course');
    }
    const courseIds = courseLinks.map((l) => l.course.id);

    const allowedCount = await this.ipcRepo.count({
      where: { institute: { id: userInstituteId }, course: In(courseIds) },
    });
    if (allowedCount === 0) {
      throw new ForbiddenException('This content does not belong to your institute');
    }

    const review = this.reviewRepo.create({
      review: dto.review,
      user,
      content,
    });
    return this.reviewRepo.save(review);
  }

  /**
   * كل الريفيوز على محتوى معيّن (مع عزل المعهد) + Pagination
   * page يبدأ من 1
   */
  async findByContent(
    contentId: number,
    userInstituteId: number,
    page = 1,
    pageSize = 10,
  ) {
    if (page < 1) page = 1;
    if (pageSize < 1 || pageSize > 100) pageSize = 10;

    // تحقق عزل المعهد
    const courseLinks = await this.courseContentRepo.find({
      where: { content: { id: contentId } },
      relations: ['course'],
    });
    if (!courseLinks.length) {
      throw new ForbiddenException('Content is not linked to any course');
    }
    const courseIds = courseLinks.map((l) => l.course.id);

    const allowedCount = await this.ipcRepo.count({
      where: { institute: { id: userInstituteId }, course: In(courseIds) },
    });
    if (allowedCount === 0) {
      throw new ForbiddenException('This content does not belong to your institute');
    }

    const [items, total] = await this.reviewRepo.findAndCount({
      where: { content: { id: contentId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      total,
      page,
      pageSize,
      items: items.map((r) => {
        const u: User | undefined = r.user;
        const displayName: string | null = u?.full_name ?? u?.username ?? null;

        return {
          id: r.id,
          review: r.review,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          user: {
            id: u?.id,          // number | undefined (مقبول في الإخراج)
            name: displayName,  // string | null
          },
        };
      }),
    };
  }

  /**
   * ريفيوهات المستخدم نفسه (لو عايز تعزل بالمعهد هنا كمان ممكن نضيف تحقق IPC)
   */
  async findMyReviews(userId: number, page = 1, pageSize = 10) {
    if (page < 1) page = 1;
    if (pageSize < 1 || pageSize > 100) pageSize = 10;

    const [items, total] = await this.reviewRepo.findAndCount({
      where: { user: { id: userId } },
      relations: ['content'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      total,
      page,
      pageSize,
      items: items.map((r) => ({
        id: r.id,
        review: r.review,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        content: r.content
          ? {
              id: r.content.id,
              image: r.content.image,
              level: r.content.level,
            }
          : null,
      })),
    };
  }

  /**
   * تعديل ريفيو — مالك الريفيو فقط
   */
  async update(reviewId: number, userId: number, dto: UpdateContentReviewDto) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: ['user'],
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.user.id !== userId) {
      throw new ForbiddenException('You can update only your own review');
    }

    if (typeof dto.review !== 'string' || dto.review.trim().length < 3) {
      throw new BadRequestException('review is required and must be at least 3 chars');
    }

    review.review = dto.review.trim();
    return this.reviewRepo.save(review);
  }

  /**
   * حذف ريفيو (Soft delete) — مالك الريفيو فقط
   */
  async remove(reviewId: number, userId: number) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: ['user'],
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.user.id !== userId) {
      throw new ForbiddenException('You can delete only your own review');
    }

    await this.reviewRepo.softRemove(review);
    return { message: 'Review deleted successfully' };
  }
}
