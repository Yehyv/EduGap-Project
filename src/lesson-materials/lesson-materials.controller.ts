// src/lesson-materials/lesson-materials.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  ParseIntPipe,
} from '@nestjs/common';
import { LessonMaterialsService } from './lesson-materials.service';
import { CreateLessonMaterialDto } from './dto/create-lesson-material.dto';
import { UpdateLessonMaterialDto } from './dto/update-lesson-material.dto';
import { CreateMaterialTypeInlineDto } from './dto/create-material-type-inline.dto';

@Controller('lesson-materials')
export class LessonMaterialsController {
  constructor(private readonly service: LessonMaterialsService) {}

  /**
   * POST /lesson-materials
   * إنشاء مرفق جديد (بيشتق content تلقائي من lesson -> topic -> content)
   */
  @Post()
  create(@Body() dto: CreateLessonMaterialDto) {
    return this.service.create(dto);
  }

  /**
   * GET /lesson-materials
   * ليستة إدارية لكل المرفقات (اختياري languageId كـ query)
   */
  @Get()
  findAll(@Query('languageId') languageId?: string) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.service.findAll(langId);
  }

  @Post('types')
  createMaterialType(@Body() dto: CreateMaterialTypeInlineDto) {
    return this.service.createMaterialType(dto);
  }

  /** DELETE /lesson-materials/types/:id — حذف نوع مرفق (soft delete) */
  @Delete('types/:id')
  deleteMaterialType(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteMaterialType(id);
  }

  /**
   * GET /lesson-materials/:id
   * مرفق واحد (اختياري languageId كـ هيدر)
   */
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.service.findOne(id, langId);
  }

  /**
   * GET /lesson-materials/lesson/:lessonId
   * مرفقات درس معيّن (اختياري languageId كـ هيدر)
   */
  @Get('lesson/:lessonId')
  findByLesson(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.service.findByLesson(lessonId, langId);
  }

  /**
   * GET /lesson-materials/content/:contentId
   * كل مرفقات الكورس (العامة + مرفقات كل الدروس التابعة له)
   * (اختياري languageId كـ هيدر)
   */
  @Get('content/:contentId')
  findByContent(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.service.findByContent(contentId, langId);
  }

  /**
   * PATCH /lesson-materials/:id
   * تعديل المرفق (ولو اتغير الدرس بيتعاد اشتقاق الـ content تلقائي)
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLessonMaterialDto,
  ) {
    return this.service.update(id, dto);
  }

  /**
   * DELETE /lesson-materials/:id
   * حذف سوفت
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
