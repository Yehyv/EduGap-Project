// src/saved-lesson/saved-lesson.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SavedLessonService } from './saved-lesson.service';
import { CreateSavedLessonDto } from './dto/create-saved-lesson.dto';
import { UnsaveLessonDto } from './dto/unsaved-lesson.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@UseGuards(JwtAuthGuard)
@Controller('saved-lessons')
export class SavedLessonController {
  constructor(private readonly service: SavedLessonService) {}

  /** POST /saved-lessons — Save (idempotent) */
  @Post()
  save(@Req() req: AuthenticatedRequest, @Body() dto: CreateSavedLessonDto) {
    const userId = req.user.sub;
    return this.service.saveLesson(userId, dto);
  }

  /** DELETE /saved-lessons — Unsave (idempotent) */
  @Delete()
  unsave(@Req() req: AuthenticatedRequest, @Body() dto: UnsaveLessonDto) {
    const userId = req.user.sub;
    return this.service.unsaveLesson(userId, dto.lessonId, dto.contentId);
  }

  /** GET /saved-lessons?languageId=&page=&limit= */
  @Get()
  list(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.sub;
    const langId = languageId ? Number(languageId) : undefined;
    const pg = page ? Number(page) : 1;
    const lim = limit ? Number(limit) : 10;
    return this.service.getUserSavedLessons(userId, langId, pg, lim);
  }
}
