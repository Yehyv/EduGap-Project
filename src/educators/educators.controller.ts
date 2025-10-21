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
} from '@nestjs/common';
import { EducatorsService } from './educators.service';
import { CreateEducatorDto } from './dto/create-educator.dto';
import { UpdateEducatorDto } from './dto/update-educator.dto';

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
}
