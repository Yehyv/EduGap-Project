import {
  Controller,
  Post,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  Get,
  Headers,
  Query,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LessonUnlockGuard } from 'src/lessons/lesson-unlock.guard';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}
  @UseGuards(LessonUnlockGuard)
  @Post(':id/complete')
  complete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.progressService.completeLesson(id, req.user.sub);
  }
  @Get('content/:contentId/summary')
  async getContentProgress(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.progressService.getContentProgress(contentId, req.user.sub);
  }
  @Get('resume-lessons')
  async getResumeLessons(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.progressService.findResumeLessonsPaginated(
      req.user.sub,
      languageId ? Number(languageId) : undefined,
      page ? Number(page) : 1,
      limit ? Number(limit) : 8,
    );
  }
}
