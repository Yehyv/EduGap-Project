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
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
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
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packagesService.create(createPackageDto);
  }

  @Get()
  findAll() {
    return this.packagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.packagesService.update(+id, updatePackageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packagesService.remove(+id);
  }
  // packages.controller.ts
  @Get(':id/basic')
  async getBasic(
    @Param('id', ParseIntPipe) id: number,
    @Query('languageId') languageId?: number,
  ) {
    return this.packagesService.getPackageBasicById(id, {
      languageId: languageId ? Number(languageId) : undefined,
    });
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
