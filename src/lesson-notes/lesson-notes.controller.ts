/* eslint-disable prettier/prettier */
// src/lesson-notes/lesson-notes.controller.ts
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
import { LessonNotesService } from './lesson-notes.service';
import { CreateLessonNoteDto } from './dto/create-lesson-note.dto';
import { UpdateLessonNoteDto } from './dto/update-lesson-note.dto';
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
@Controller('lesson-notes')
export class LessonNotesController {
  constructor(private readonly service: LessonNotesService) {}

  /** Create note on a lesson */
  @Post('lessons/:lessonId')
  create(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateLessonNoteDto,
  ) {
    return this.service.create(lessonId, req.user.sub, dto);
  }

  /** List current user's notes for a lesson (paginated) */
  @Get('lessons/:lessonId/me')
  listForLessonMe(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 10;
    return this.service.findForLessonMe(lessonId, req.user.sub, p, l);
  }

  /** Get single note (owner only) */
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.service.findOne(id, req.user.sub);
  }

  /** Update (owner only) */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateLessonNoteDto,
  ) {
    return this.service.update(id, req.user.sub, dto);
  }

  /** Delete (owner only) */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.service.remove(id, req.user.sub);
  }
}
