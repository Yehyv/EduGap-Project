/* eslint-disable prettier/prettier */
import {
  Controller,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
  Get,
  Headers,
  Req,
} from '@nestjs/common';
import { ContentsService } from 'src/contents/contents.service';
import { PackagesService } from './packages.service';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@Controller('packages-contents')
// @UseGuards(JwtAuthGuard) // فعّل الجارد لو البوابة دي للداشبورد فقط
export class PackageContentsController {
  constructor(private readonly contentsService: ContentsService, private readonly packagesService: PackagesService) {}

  /**
   * PATCH /packages/:packageId/contents
   * Assign contents to a package (idempotent + soft-recover).
   * Body: { contentIds: number[] }
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Get('first-8')
  getFirst8(@Headers('languageId') languageId?: string, @Req() req?: AuthenticatedRequest) {
    const langId = languageId ? Number(languageId) : undefined;
    const userId = req?.user?.sub;
    return this.packagesService.findPackagesFirst8(langId, userId);
  }
  @UseGuards(OptionalJwtAuthGuard)
  @Get('paginated')
  getPaginated(
    @Headers('languageId') languageId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 8;
    const userId = req?.user?.sub;
    return this.packagesService.findPackagesPaginated(langId, p, l, userId);
  }
  @Patch(':packageId/contents/:contentId/assign')
  async assignContentsToPackage(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Param('contentId') contentId: number,
  ) {
    return this.contentsService.assignContentToPackage(packageId, contentId);
  }

  /**
   * DELETE /packages/:packageId/contents
   * Unassign contents from a package (soft delete).
   * Body: { contentIds: number[] }
   */
  @Delete(':packageId/contents/:contentId/un-assign')
  async unassignContentsFromPackage(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Param('contentId') contentId: number,
  ) {
    return this.contentsService.unAssignContentFromPackage(
      packageId,
      contentId,
    );
  }
  @Get('packages/:packageId/contents/dropdown')
contentsForPackageDropDown(
  @Param('packageId', ParseIntPipe) packageId: number,
  @Headers('languageId') languageId?: number,
) {
  return this.contentsService.contentsForPackageDropDown(
    packageId,
    languageId ? Number(languageId) : undefined,
  );
}

}
