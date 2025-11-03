import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LessonReactionsService } from './lesson-reactions.service';
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
@Controller('lesson-reactions')
export class LessonReactionsController {
  constructor(private readonly service: LessonReactionsService) {}

  /** Like */
  @Post('lessons/:lessonId/like')
  like(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.toggleLike(lessonId, req.user.sub);
  }

  @Post('lessons/:lessonId/dislike')
  dislike(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.toggleDislike(lessonId, req.user.sub);
  }

  /** Likes count فقط */
  @Get('lessons/:lessonId/likes-count')
  countLikes(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.service.countLikes(lessonId);
  }

  /** (اختياري) summary = likes + dislikes + userReaction */
  @Get('lessons/:lessonId/summary')
  summary(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.summary(lessonId, req.user?.sub);
  }
}
