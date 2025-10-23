import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LessonReaction } from './entities/lesson-reaction.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class LessonReactionsService {
  constructor(
    @InjectRepository(LessonReaction)
    private readonly reactionRepo: Repository<LessonReaction>,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /** upsert: set reaction (0/1) for (user, lesson) */
  // LessonReactionsService
  async setReaction(lessonId: number, userId: number, reaction: 0 | 1) {
    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException(`Lesson ${lessonId} not found`);

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    // 👇 دور على السجل حتى لو ممسوح (withDeleted: true)
    let rec = await this.reactionRepo.findOne({
      where: { lesson: { id: lessonId }, user: { id: userId } },
      withDeleted: true,
      relations: ['lesson', 'user'],
    });

    if (rec) {
      // لو كان Soft-deleted رجّعه
      if (rec.deleted_at) {
        await this.reactionRepo.recover(rec); // sets deleted_at = NULL
      }
      rec.reaction = reaction;
      await this.reactionRepo.save(rec);
    } else {
      rec = this.reactionRepo.create({ lesson, user, reaction });
      await this.reactionRepo.save(rec);
    }

    return {
      id: rec.id,
      lessonId,
      userId,
      reaction: rec.reaction,
    };
  }

  async removeReaction(lessonId: number, userId: number) {
    const rec = await this.reactionRepo.findOne({
      where: { lesson: { id: lessonId }, user: { id: userId } },
    });
    if (!rec) return { message: 'No reaction to remove' };

    await this.reactionRepo.softDelete(rec.id);
    return { message: 'Reaction removed successfully' };
  }

  /** Like */
  async like(lessonId: number, userId: number) {
    return this.setReaction(lessonId, userId, 1);
  }

  /** Dislike */
  async dislike(lessonId: number, userId: number) {
    return this.setReaction(lessonId, userId, 0);
  }

  /** Count likes (reaction=1) for one lesson */
  async countLikes(lessonId: number) {
    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException(`Lesson ${lessonId} not found`);

    const likes = await this.reactionRepo.count({
      where: { lesson: { id: lessonId }, reaction: 1 },
    });
    return { lessonId, likes };
  }

  /** (اختياري) Summary: likes + dislikes + currentUserReaction */
  async summary(lessonId: number, userId?: number) {
    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException(`Lesson ${lessonId} not found`);

    const [likes, dislikes] = await Promise.all([
      this.reactionRepo.count({
        where: { lesson: { id: lessonId }, reaction: 1 },
      }),
      this.reactionRepo.count({
        where: { lesson: { id: lessonId }, reaction: 0 },
      }),
    ]);

    let userReaction: 0 | 1 | null = null;
    if (userId) {
      const rec = await this.reactionRepo.findOne({
        where: { lesson: { id: lessonId }, user: { id: userId } },
        select: ['reaction'],
      });
      userReaction = (rec?.reaction ?? null) as 0 | 1 | null;
    }

    return { lessonId, likes, dislikes, userReaction };
  }
}
