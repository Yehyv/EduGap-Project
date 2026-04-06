import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  Req,
  Headers,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { EducatorsService } from './educators.service';
import { CreateEducatorDto } from './dto/create-educator.dto';
import { UpdateEducatorDto } from './dto/update-educator.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageStorage } from 'src/common/helpers/upload.helper';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@Controller('educators')
export class EducatorsController {
  constructor(private readonly educatorsService: EducatorsService) {}

  /** POST /educators — إنشاء محاضر */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  @UseInterceptors(FileInterceptor('image', imageStorage('educator-images')))
  create(
    @Body() dto: CreateEducatorDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.educatorsService.create(dto, req.user.sub, image);
  }

  /**
   * GET /educators — قائمة بالمحاضرين مع بحث وباجينيشن
   * Query:
   *  - search?: string
   *  - page?: number (default 1)
   *  - limit?: number (default 20)
   *  - onlyActive?: number (0/1)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('super-admin/educators-list')
  findAllForAdmin(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('onlyActive') onlyActive?: string,
  ) {
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 20;
    const oa = onlyActive !== undefined ? Number(onlyActive) : undefined;
    return this.educatorsService.findAllForAdmin(search, p, l, oa);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('')
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('onlyActive') onlyActive?: string,
  ) {
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 20;
    const oa = onlyActive !== undefined ? Number(onlyActive) : undefined;
    return this.educatorsService.findAll(search, p, l, oa);
  }
  @Get('all/nav')
  findAllForNav(@Query('onlyActive') onlyActive?: string) {
    const oa = onlyActive !== undefined ? Number(onlyActive) : 1;
    return this.educatorsService.educatorsNav(oa);
  }

  /**
   * GET /educators/first-8 — أول 8 (افتراضيًا active فقط)
   * Query:
   *  - onlyActive?: number (0/1) — default 1
   */
  @Get('first-8')
  firstEight(@Query('onlyActive') onlyActive?: string) {
    const oa = onlyActive !== undefined ? Number(onlyActive) : 1;
    return this.educatorsService.findFirstEight(oa);
  }

  /** GET /educators/:id — محاضر واحد */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('super-admin/educator/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.educatorsService.findOne(id);
  }
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findEducator(@Param('id', ParseIntPipe) id: number) {
    return this.educatorsService.findEducator(id);
  }

  /** PATCH /educators/:id — تحديث محاضر */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch('super-admin/:id')
  @UseInterceptors(FileInterceptor('image', imageStorage('educator-images')))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEducatorDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.educatorsService.update(id, dto, image);
  }

  /** DELETE /educators/:id — حذف (Soft delete) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete('super-admin/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.educatorsService.remove(id);
  }
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/contents')
  async findContentsByEducator(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
    @Headers('languageId') languageIdRaw?: string,
    @Query('programId') programIdRaw?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const page = pageRaw ? Number(pageRaw) : 1;
    const limit = limitRaw ? Number(limitRaw) : 8;
    const languageId = languageIdRaw ? Number(languageIdRaw) : undefined;
    const programId = programIdRaw ? Number(programIdRaw) : undefined;
    const instituteId = req?.user?.instituteId
      ? Number(req.user.instituteId)
      : undefined;
    const userId = req?.user?.sub ? Number(req.user.sub) : undefined;

    return this.educatorsService.findContentsByEducator(id, {
      page,
      limit,
      languageId,
      instituteId,
      programId,
      userId,
    });
  }
}
