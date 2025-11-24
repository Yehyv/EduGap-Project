import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Req,
  UseGuards,
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
  constructor(private readonly savedSrv: SavedContentsService) {}

  @Post(':contentId/save')
  save(
    @Req() req: AuthenticatedRequest,
    @Param('contentId', ParseIntPipe) contentId: number,
  ) {
    return this.savedSrv.save(req.user.sub, contentId);
  }

  @Delete(':contentId/unsave')
  async unsave(
    @Req() req: AuthenticatedRequest,
    @Param('contentId', ParseIntPipe) contentId: number,
  ) {
    await this.savedSrv.unsave(req.user.sub, contentId);
    return { success: true };
  }

  @Post(':contentId/toggle')
  toggle(
    @Req() req: AuthenticatedRequest,
    @Param('contentId', ParseIntPipe) contentId: number,
  ) {
    return this.savedSrv.toggle(req.user.sub, contentId);
  }

  @Get('is-saved/:contentId')
  isSaved(
    @Req() req: AuthenticatedRequest,
    @Param('contentId', ParseIntPipe) contentId: number,
  ) {
    return this.savedSrv.isSaved(req.user.sub, contentId);
  }
  @Get()
  list(
    @Req() req: AuthenticatedRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Headers('languageId') languageId?: string,
  ) {
    return this.savedSrv.listUserSavedContents(req.user.sub, {
      page,
      limit,
      search,
      languageId: languageId ? Number(languageId) : undefined,
    });
  }
  @Get('all/nav')
  async listMinimal(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user?.sub; // حسب الـ JWT عندك
    const items = await this.savedSrv.savedContentsNav(userId, {
      languageId: languageId ? Number(languageId) : undefined,
      limit: limit ? Math.min(50, Math.max(1, Number(limit))) : 12,
    });
    return { items };
  }
}
