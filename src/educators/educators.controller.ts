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
} from '@nestjs/common';
import { EducatorsService } from './educators.service';
import { CreateEducatorDto } from './dto/create-educator.dto';
import { UpdateEducatorDto } from './dto/update-educator.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
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
  @Post()
  create(@Body() dto: CreateEducatorDto) {
    return this.educatorsService.create(dto);
  }

  /**
   * GET /educators — قائمة بالمحاضرين مع بحث وباجينيشن
   * Query:
   *  - search?: string
   *  - page?: number (default 1)
   *  - limit?: number (default 20)
   *  - onlyActive?: number (0/1)
   */
  @Get()
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
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.educatorsService.findOne(id);
  }

  /** PATCH /educators/:id — تحديث محاضر */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEducatorDto,
  ) {
    return this.educatorsService.update(id, dto);
  }

  /** DELETE /educators/:id — حذف (Soft delete) */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.educatorsService.remove(id);
  }
  @UseGuards(JwtAuthGuard)
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
