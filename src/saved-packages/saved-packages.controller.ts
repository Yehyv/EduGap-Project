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
} from '@nestjs/common';
import { SavedPackagesService } from './saved-packages.service';
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
@Controller('saved-packages')
export class SavedPackagesController {
  constructor(private readonly savedSrv: SavedPackagesService) {}

  @Post(':packageId/save')
  save(
    @Req() req: AuthenticatedRequest,
    @Param('packageId', ParseIntPipe) packageId: number,
  ) {
    return this.savedSrv.save(req.user.sub, packageId);
  }

  @Delete(':packageId/unsave')
  async unsave(
    @Req() req: AuthenticatedRequest,
    @Param('packageId', ParseIntPipe) packageId: number,
  ) {
    await this.savedSrv.unsave(req.user.sub, packageId);
    return { success: true };
  }

  @Post(':packageId/toggle')
  toggle(
    @Req() req: AuthenticatedRequest,
    @Param('packageId', ParseIntPipe) packageId: number,
  ) {
    return this.savedSrv.toggle(req.user.sub, packageId);
  }

  @Get('is-saved/:packageId')
  isSaved(
    @Req() req: AuthenticatedRequest,
    @Param('packageId', ParseIntPipe) packageId: number,
  ) {
    return this.savedSrv.isSaved(req.user.sub, packageId);
  }

  @Get()
  list(
    @Req() req: AuthenticatedRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.savedSrv.listUserSavedPackages(req.user.sub, {
      page,
      limit,
      search,
    });
  }
}
