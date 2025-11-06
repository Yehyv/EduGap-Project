import {
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SavedLessonService } from './saved-lesson.service';
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

  /** TOGGLE — POST /saved-lessons/lessons/:lessonId/toggle */
  @Post('lessons/:lessonId/toggle')
  toggle(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.toggleSave(req.user.sub, lessonId);
  }

  /** Explicit UNSAVE — DELETE /saved-lessons/lessons/:lessonId */
  @Delete('lessons/:lessonId')
  unsave(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.unsaveByLesson(req.user.sub, lessonId);
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
  @Get('content/:contentId/me')
  @UseGuards(JwtAuthGuard)
  async getMySavedLessonsForContent(
    @Req() req: AuthenticatedRequest,
    @Param('contentId', ParseIntPipe) contentId: number,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
    @Query('languageId') languageIdRaw?: string,
  ) {
    const userId = req.user.sub;
    const page = Math.max(1, Number(pageRaw) || 1);
    const limit = Math.max(1, Number(limitRaw) || 10);
    const languageId = languageIdRaw ? Number(languageIdRaw) : undefined;

    return this.service.getUserSavedLessonsForContent(
      userId,
      contentId,
      languageId,
      page,
      limit,
    );
  }
}
