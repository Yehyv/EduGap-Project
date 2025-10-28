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
} from '@nestjs/common';
import { ContentsService } from 'src/contents/contents.service';
import { PackagesService } from './packages.service';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('packages-contents')
// @UseGuards(JwtAuthGuard) // فعّل الجارد لو البوابة دي للداشبورد فقط
export class PackageContentsController {
  constructor(private readonly contentsService: ContentsService, private readonly packagesService: PackagesService) {}

  /**
   * PATCH /packages/:packageId/contents
   * Assign contents to a package (idempotent + soft-recover).
   * Body: { contentIds: number[] }
   */
  @Get('first-8')
  getFirst8(@Headers('languageId') languageId?: string) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.packagesService.findPackagesFirst8(langId);
  }

  @Get('paginated')
  getPaginated(
    @Headers('languageId') languageId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 8;
    return this.packagesService.findPackagesPaginated(langId, p, l);
  }
  @Patch(':packageId/contents')
  async assignContentsToPackage(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Body('contentIds') contentIds: number[],
  ) {
    return this.contentsService.assignContentToPackage(packageId, contentIds);
  }

  /**
   * DELETE /packages/:packageId/contents
   * Unassign contents from a package (soft delete).
   * Body: { contentIds: number[] }
   */
  @Delete(':packageId/contents')
  async unassignContentsFromPackage(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Body('contentIds') contentIds: number[],
  ) {
    return this.contentsService.unAssignContentFromPackage(
      packageId,
      contentIds,
    );
  }
}
