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
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TopicWithLessonsStatus } from './types/lesson-status.types';
import { LessonUnlockGuard } from './lesson-unlock.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageStorage } from 'src/common/helpers/upload.helper';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  /**
   * POST /lessons
   * إنشاء Lesson داخل Topic محدد
   */
  @Post()
  @UseInterceptors(FileInterceptor('image', imageStorage('lesson-images')))
  create(
    @Body() createLessonDto: CreateLessonDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.lessonsService.create(createLessonDto, image);
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
  @UseInterceptors(FileInterceptor('image', imageStorage('lesson-images')))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLessonDto: UpdateLessonDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.lessonsService.update(id, updateLessonDto, image);
  }

  /**
   * DELETE /lessons/:id
   * حذف (Soft delete)
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lessonsService.remove(id);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':lessonId/actions')
  getActionsStatus(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.lessonsService.getLessonActionsStatus(req.user.sub, lessonId);
  }
  // قائمة التوبيكس + حالة الدروس (لازم يكون مُصادق ومُسجَّل في المحتوى)
  @UseGuards(JwtAuthGuard)
  @Get('content/:contentId/topics-with-status')
  async getTopicsWithStatus(
    @Param('contentId') contentId: string,
    @Headers('languageId') languageId: string | undefined,
    @Req() req: any,
  ): Promise<TopicWithLessonsStatus[]> {
    const userId = Number(req.user?.sub);
    return this.lessonsService.getTopicsWithStatus(Number(contentId), userId, {
      languageId: languageId ? Number(languageId) : undefined,
    });
  }

  // قراءة درس (محمي بالجارد: لازم السابق مكتمل)
  @UseGuards(JwtAuthGuard, LessonUnlockGuard)
  @Get(':id/content')
  async getLesson(@Param('id') id: string) {
    // تقدر هنا ترجع getLessonContent(...) أو تفاصيل كاملة
    return this.lessonsService.getLessonContent(Number(id));
  }
}
