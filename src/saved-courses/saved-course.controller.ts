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
  DefaultValuePipe,
} from '@nestjs/common';
import { SavedCoursesService } from './saved-course.service';
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
export class SavedContentsController {
  constructor(private readonly savedCoursesService: SavedCoursesService) {}

  // @Post(':contentId/save')
  // async saveContent(
  //   @Req() req: AuthenticatedRequest,
  //   @Param('contentId') contentId: number,
  // ) {
  //   return this.savedContentsService.saveContent(
  //     contentId,
  //     req.user.sub,
  //     req.user.instituteId,
  //   );
  // }

  @Get()
  list(
    @Req() req: AuthenticatedRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Headers('languageId') languageId?: string,
  ) {
    const userId = req.user.sub;
    return this.savedCoursesService.listUserSavedCourses(userId, {
      page: Number(page),
      limit: Number(limit),
      search,
      languageId: languageId ? Number(languageId) : undefined,
    });
  }

  @Post(':courseId/save')
  save(
    @Req() req: AuthenticatedRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    const userId = req.user.sub;
    return this.savedCoursesService.saveCourse(userId, courseId);
  }

  @Delete(':courseId/unsave')
  async unsave(
    @Req() req: AuthenticatedRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    const userId = req.user.sub;
    await this.savedCoursesService.unsaveCourse(userId, courseId);
    return { success: true };
  }

  @Post(':courseId/toggle')
  toggle(
    @Req() req: AuthenticatedRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    const userId = req.user.sub;
    return this.savedCoursesService.toggleSave(userId, courseId);
  }

  @Get('is-saved/:courseId')
  isSaved(
    @Req() req: AuthenticatedRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    const userId = req.user.sub;
    return this.savedCoursesService.isSaved(userId, courseId);
  }
}
