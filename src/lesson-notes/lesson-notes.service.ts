// src/lesson-notes/lesson-notes.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';

import { LessonNote } from './entities/lesson-note.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateLessonNoteDto } from './dto/create-lesson-note.dto';
import { UpdateLessonNoteDto } from './dto/update-lesson-note.dto';

@Injectable()
export class LessonNotesService {
  constructor(
    @InjectRepository(LessonNote)
    private readonly noteRepo: Repository<LessonNote>,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /** Create a note for a lesson (by the logged-in user) */
  async create(lessonId: number, userId: number, dto: CreateLessonNoteDto) {
    const [lesson, user] = await Promise.all([
      this.lessonRepo.findOne({ where: { id: lessonId } }),
      this.userRepo.findOne({ where: { id: userId } }),
    ]);
    if (!lesson) throw new NotFoundException(`Lesson ${lessonId} not found`);
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const note = this.noteRepo.create({
      notes: dto.notes,
      lesson,
      user,
    });

    const saved = await this.noteRepo.save(note);
    return this.findOne(saved.id, userId); // رجّع الشكل الموحّد
  }

  /** List current user's notes for a specific lesson (paginated) */
  async findForLessonMe(
    lessonId: number,
    userId: number,
    page: number = 1,
    limit: number = 10,
  ) {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<LessonNote> = {
      lesson: { id: lessonId },
      user: { id: userId },
    };

    const [rows, total] = await this.noteRepo.findAndCount({
      where,
      relations: ['lesson', 'user', 'content'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const items = rows.map((n) => ({
      id: n.id,
      notes: n.notes,
      created_at: n.created_at,
      updated_at: n.updated_at,
      lessonId: n.lesson?.id ?? null,
      contentId: n.content?.id ?? null,
      user: {
        id: n.user?.id ?? null,
        full_name: n.user?.full_name ?? '',
        image: n.user?.user_image ?? null,
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

  /** Get single note (must belong to current user) */
  async findOne(id: number, userId: number) {
    const n = await this.noteRepo.findOne({
      where: { id },
      relations: ['lesson', 'user', 'content'],
    });
    if (!n) throw new NotFoundException(`Note ${id} not found`);
    if (n.user?.id !== userId) {
      // ممكن تعمل عرض فقط بدون منع، لكن منطقيًا النوتس شخصية
      throw new ForbiddenException('You can only access your own note');
    }

    return {
      id: n.id,
      notes: n.notes,
      created_at: n.created_at,
      updated_at: n.updated_at,
      lessonId: n.lesson?.id ?? null,
      contentId: n.content?.id ?? null,
      user: {
        id: n.user?.id ?? null,
        full_name: n.user?.full_name ?? '',
        image: n.user?.user_image ?? null,
      },
    };
  }

  /** Update note (owner only) */
  async update(id: number, userId: number, dto: UpdateLessonNoteDto) {
    const n = await this.noteRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!n) throw new NotFoundException(`Note ${id} not found`);
    if (n.user?.id !== userId) {
      throw new ForbiddenException('You can only edit your own note');
    }

    if (dto.notes !== undefined) n.notes = dto.notes;
    await this.noteRepo.save(n);
    return this.findOne(id, userId);
  }

  /** Delete note (owner only) — soft delete */
  async remove(id: number, userId: number) {
    const n = await this.noteRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!n) throw new NotFoundException(`Note ${id} not found`);
    if (n.user?.id !== userId) {
      throw new ForbiddenException('You can only delete your own note');
    }

    await this.noteRepo.softDelete(id);
    return { message: 'Note deleted successfully' };
  }
}
