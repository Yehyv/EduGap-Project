import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  Headers,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  /**
   * POST /lessons
   * إنشاء Lesson داخل Topic محدد
   */
  @Post()
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(createLessonDto);
  }

  /**
   * GET /lessons?languageId=&topicId=
   * جلب كل الدروس مع فلاتر اختيارية:
   *  - languageId: لتصفية الترجمة
   *  - topicId: لتصفية الدروس الخاصة بتوبيك معين
   */
  @Get()
  findAll(
    @Query('languageId') languageId?: string,
    @Query('topicId') topicId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const tId = topicId ? Number(topicId) : undefined;
    return this.lessonsService.findAll(langId, tId);
  }

  /**
   * GET /lessons/:id
   * جلب درس واحد (يدعم languageId كهيدر اختياري)
   */
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.lessonsService.findOne(id, langId);
  }

  /**
   * PATCH /lessons/:id
   * تحديث الدرس (topic/order/isActive/... + replace translations لو مبعوتة)
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  /**
   * DELETE /lessons/:id
   * حذف (Soft delete)
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lessonsService.remove(id);
  }
}
