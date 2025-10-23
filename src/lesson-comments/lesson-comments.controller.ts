// src/lesson-comments/lesson-comments.controller.ts
/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LessonCommentsService } from './lesson-comments.service';
import { CreateLessonCommentDto } from './dto/create-lesson-comment.dto';
import { UpdateLessonCommentDto } from './dto/update-lesson-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// لو عندك نوع request فيه user:
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@UseGuards(JwtAuthGuard)
@Controller('lesson-comments')
export class LessonCommentsController {
  constructor(private readonly service: LessonCommentsService) {}

  /** Create comment on a lesson */
  @Post('lessons/:lessonId')
  create(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateLessonCommentDto,
  ) {
    const userId = req.user?.sub;
    return this.service.create(lessonId, userId, dto);
  }

  /** List comments for a lesson (paginated) */
  @Get('lessons/:lessonId')
  listForLesson(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 10;
    return this.service.findForLesson(lessonId, p, l);
  }

  /** Get single comment */
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /** Update (owner only) */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateLessonCommentDto,
  ) {
    const userId = req.user?.sub;
    return this.service.update(id, userId, dto);
  }

  /** Delete (owner only) */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub;
    return this.service.remove(id, userId);
  }
}
