import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
  Headers,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageStorage } from 'src/common/helpers/upload.helper';
interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', imageStorage('package-images')))
  create(
    @Body() createPackageDto: CreatePackageDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.packagesService.create(createPackageDto, image);
  }

  @Get('super-admin/packages-list')
  findAll(@Headers('languageId') languageId?: string,) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.packagesService.findAll(langId);
  }
  @Get('all/nav')
  findAllForNav(@Headers('languageId') languageId?: number) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.packagesService.packagesNav(langId);
  }

  @Get('super-admin/package/:id')
  findOne(@Param('id') id: number, @Headers('languageId') languageId?: string) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.packagesService.findOne(id, langId);
  }

  @Patch('super-admin/:id')
  @UseInterceptors(FileInterceptor('image', imageStorage('package-images')))
  update(
    @Param('id') id: number,
    @Body() updatePackageDto: UpdatePackageDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.packagesService.update(id, updatePackageDto, image);
  }

  @Delete('super-admin/:id')
  remove(@Param('id') id: string) {
    return this.packagesService.remove(+id);
  }
  @Patch('super-admin/package-status/:id')
  async changePackageStatus(@Param('id', ParseIntPipe) id: number) {
    return this.packagesService.toggleActive(id);
  }
  // packages.controller.ts
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/basic')
  async getBasic(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: number,
  ) {
    return this.packagesService.getPackageBasicById(
      id,
      {
        languageId: languageId ? Number(languageId) : undefined,
      },
      req.user?.sub,
    );
  }
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/contents')
  async getContents(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('languageId') languageId?: number,
  ) {
    const userId = req?.user?.sub ? Number(req.user.sub) : undefined;
    return this.packagesService.getPackageContentsPaginated(id, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 8,
      languageId: languageId ? Number(languageId) : undefined,
      userId: userId ? Number(userId) : undefined,
    });
  }
}
