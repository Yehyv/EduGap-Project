import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { SavedCoursesService } from './saved-courses.service';
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
@Controller('saved-courses')
export class SavedCoursesController {
  constructor(private readonly savedCoursesService: SavedCoursesService) {}

  @Post(':courseId/save')
  async saveCourse(
    @Req() req: AuthenticatedRequest,
    @Param('courseId') courseId: number,
  ) {
    return this.savedCoursesService.saveCourse(
      courseId,
      req.user.sub,
      req.user.instituteId,
    );
  }

  @Delete(':courseId/unsave')
  async unsaveCourse(
    @Req() req: AuthenticatedRequest,
    @Param('courseId') courseId: number,
  ) {
    return this.savedCoursesService.unsaveCourse(courseId, req.user.sub);
  }

  @Get('user')
  async getUserSavedCourses(
    @Req() req: AuthenticatedRequest,
    @Param('courseId') courseId: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId !== undefined ? +languageId : 0;
    return this.savedCoursesService.getUserSavedCourses(
      req.user.sub,
      req.user.instituteId,
      langId,
    );
  }

  @Get(':courseId/is-saved')
  async isCoursesSaved(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    const isSaved = await this.savedCoursesService.isCoursesSaved(
      courseId,
      userId,
    );
    return { isSaved };
  }
}
