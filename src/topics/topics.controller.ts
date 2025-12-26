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
  @Get('super-admin/topics-list')
  findAll(
    @Query('languageId') languageId?: string,
    @Query('contentId') contentId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const cId = contentId ? Number(contentId) : undefined;
    return this.topicsService.findAll(langId, cId);
  }
  @Get('super-admin/topics/:id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('contentId') contentId: string,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const contId = contentId ? Number(contentId) : undefined;

    return this.topicsService.findOne(id, langId, contId);
  }

  /**
   * PATCH /topics/:id
   * تحديث التوبيك (content/order/isActive + replace translations لو مبعوتة)
   */
  @Patch('super-admin/:id')
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
  @Delete('super-admin/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.topicsService.remove(id);
  }
  @Get(':contentId/topics')
  async getTopics(
    @Param('contentId') contentId: string,
    @Headers('languageId') languageId?: string,
  ) {
    return this.topicsService.getTopics(Number(contentId), {
      languageId: languageId ? Number(languageId) : undefined,
    });
  }
}
