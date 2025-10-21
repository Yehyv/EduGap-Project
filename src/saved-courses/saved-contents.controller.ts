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
import { SavedContentsService } from './saved-contents.service';
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
@Controller('saved-contents')
export class SavedContentsController {
  constructor(private readonly savedContentsService: SavedContentsService) {}

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

  // @Delete(':courseId/unsave')
  // async unsaveContent(
  //   @Req() req: AuthenticatedRequest,
  //   @Param('courseId') courseId: number,
  // ) {
  //   return this.savedContentsService.unsaveContent(courseId, req.user.sub);
  // }

  // @Get('user')
  // async getUserSavedContent(
  //   @Req() req: AuthenticatedRequest,
  //   @Headers('languageId') languageId?: string,
  // ) {
  //   const langId = languageId !== undefined ? +languageId : 0;
  //   return this.savedContentsService.getUserSavedContent(
  //     req.user.sub,
  //     req.user.instituteId,
  //     langId,
  //   );
  // }
  // @Get('user/first-8')
  // async getFirstEight(
  //   @Req() req: AuthenticatedRequest,
  //   @Headers('languageId') languageId?: string,
  // ) {
  //   const langId = languageId !== undefined ? +languageId : 0;
  //   return this.savedContentsService.getFirstEight(
  //     req.user.sub,
  //     req.user.instituteId,
  //     langId,
  //   );
  // }

  // @Get(':contentId/is-saved')
  // async isCoursesSaved(
  //   @Param('contentId', ParseIntPipe) contendId: number,
  //   @Query('userId', ParseIntPipe) userId: number,
  // ) {
  //   const isSaved = await this.savedContentsService.isContentsSaved(
  //     contendId,
  //     userId,
  //   );
  //   return { isSaved };
  // }
}
