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
  Req,
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
// @UseGuards(JwtAuthGuard) // dashboard-only; لو عايزها عامة، اشيل الجارد
interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  /**
   * POST /topics
   * إنشاء Topic داخل Content محدد
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  create(
    @Body() createTopicDto: CreateTopicDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new Error('User not authenticated');
    return this.topicsService.create(createTopicDto, userId);
  }

  /**
   * GET /topics?languageId=&contentId=
   * جلب التوبيكس - يدعم فلترة باللغة وبالكونتنت
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('super-admin/topics-list')
  findAll(
    @Query('languageId') languageId?: string,
    @Query('contentId') contentId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const cId = contentId ? Number(contentId) : undefined;
    return this.topicsService.findAll(langId, cId);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('super-admin/topics/:id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('contentId') contentId: string,
  ) {
    const contId = contentId ? Number(contentId) : undefined;

    return this.topicsService.findOne(id, contId);
  }

  /**
   * PATCH /topics/:id
   * تحديث التوبيك (content/order/isActive + replace translations لو مبعوتة)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete('super-admin/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.topicsService.remove(id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN')
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
