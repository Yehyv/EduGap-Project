import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// @UseGuards(JwtAuthGuard) // dashboard-only; لو عايزها عامة، اشيل الجارد
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  /**
   * POST /topics
   * إنشاء Topic داخل Content محدد
   */
  @Post()
  create(@Body() createTopicDto: CreateTopicDto) {
    return this.topicsService.create(createTopicDto);
  }

  /**
   * GET /topics?languageId=&contentId=
   * جلب التوبيكس - يدعم فلترة باللغة وبالكونتنت
   */
  @Get()
  findAll(
    @Query('languageId') languageId?: string,
    @Query('contentId') contentId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const cId = contentId ? Number(contentId) : undefined;
    return this.topicsService.findAll(langId, cId);
  }

  /**
   * GET /topics/:id
   * جلب توبيك واحد (يدعم languageId كـ هيدر اختياري)
   */
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.topicsService.findOne(id, langId);
  }

  /**
   * PATCH /topics/:id
   * تحديث التوبيك (content/order/isActive + replace translations لو مبعوتة)
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTopicDto: UpdateTopicDto,
  ) {
    return this.topicsService.update(id, updateTopicDto);
  }

  /**
   * DELETE /topics/:id
   * حذف (Soft delete)
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.topicsService.remove(id);
  }
}
