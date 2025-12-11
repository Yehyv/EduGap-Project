// src/lesson-comments/lesson-comments.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LessonComment } from './entities/lesson-comment.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateLessonCommentDto } from './dto/create-lesson-comment.dto';
import { UpdateLessonCommentDto } from './dto/update-lesson-comment.dto';
import { formatRelativeDate } from 'src/common/helpers/date-format';
@Injectable()
export class LessonCommentsService {
  constructor(
    @InjectRepository(LessonComment)
    private readonly commentRepo: Repository<LessonComment>,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /** Create comment on a lesson */
  async create(lessonId: number, userId: number, dto: CreateLessonCommentDto) {
    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException(`Lesson ${lessonId} not found`);

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const comment = this.commentRepo.create({
      comment: dto.comment,
      lesson,
      user,
    });
    const saved = await this.commentRepo.save(comment);

    // رجّع شكل مرتب مع بيانات اليوزر
    return this.findOne(saved.id);
  }

  /** List comments for a lesson (paginated) */
  async findForLesson(lessonId: number, page: number = 1, limit: number = 10) {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    const skip = (page - 1) * limit;

    const [rows, total] = await this.commentRepo.findAndCount({
      where: { lesson: { id: lessonId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const items = rows.map((c) => ({
      id: c.id,
      comment: c.comment,
      createdAt: formatRelativeDate(c.createdAt),
      updatedAt: c.updatedAt,
      user: {
        id: c.user?.id ?? null,
        full_name: c.user?.full_name ?? '',
        image: c.user?.user_image ?? null,
      },
    }));

    return {
      items,
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

  /** Single comment (with user) */
  async findOne(id: number) {
    const c = await this.commentRepo.findOne({
      where: { id },
      relations: ['user', 'lesson'],
    });
    if (!c) throw new NotFoundException(`Comment ${id} not found`);

    return {
      id: c.id,
      comment: c.comment,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      lessonId: c.lesson?.id ?? null,
      user: {
        id: c.user?.id ?? null,
        full_name: c.user?.full_name ?? '',
        image: c.user?.user_image ?? null,
      },
    };
  }

  /** Update (owner only) */
  async update(id: number, userId: number, dto: UpdateLessonCommentDto) {
    const c = await this.commentRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!c) throw new NotFoundException(`Comment ${id} not found`);
    if (c.user?.id !== userId) {
      throw new ForbiddenException('You can only edit your own comment');
    }

    if (dto.comment !== undefined) c.comment = dto.comment;
    await this.commentRepo.save(c);
    return this.findOne(id);
  }

  /** Delete (owner only) — Soft delete */
  async remove(id: number, userId: number) {
    const c = await this.commentRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!c) throw new NotFoundException(`Comment ${id} not found`);
    if (c.user?.id !== userId) {
      throw new ForbiddenException('You can only delete your own comment');
    }

    await this.commentRepo.softDelete(id);
    return { message: 'Comment deleted successfully' };
  }
}
