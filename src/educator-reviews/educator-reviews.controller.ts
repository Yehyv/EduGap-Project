// src/educator-reviews/educator-reviews.controller.ts
import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { EducatorReviewsService } from './educator-reviews.service';
import { CreateEducatorReviewDto } from './dto/create-educator-review.dto';
import { UpdateEducatorReviewDto } from './dto/update-educator-review.dto';

// 🔐 فعّل الجارد الحقيقي عندك
// import { AuthGuard } from '@nestjs/passport';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@Controller('educators')
export class EducatorReviewsController {
  constructor(private readonly svc: EducatorReviewsService) {}

  /**
   * ✅ Upsert: إضافة/تحديث تقييم + ريفيو لنفس (user, educator, content)
   * POST /educators/:educatorId/reviews
   * body: { contentId, rating (1..5 float), review? }
   * يتطلب: أن المستخدم مكمل المحتوى (status=1) والمحتوى يعود لنفس المدرس.
   */
  // @UseGuards(AuthGuard('jwt'))
  @Post(':educatorId/reviews')
  async upsert(
    @Param('educatorId', ParseIntPipe) educatorId: number,
    @Body() dto: CreateEducatorReviewDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub; // هات الـuserId من الجارد
    // نثبت الـeducatorId من الـpath على الـDTO
    return this.svc.upsert(userId, { ...dto, educatorId });
  }

  /**
   * ✏️ تعديل تقييم/ريفيو موجود
   * PATCH /educators/reviews/:id
   * body: أي subset من { rating, review } (لا تغيّر educatorId/contentId)
   */
  // @UseGuards(AuthGuard('jwt'))
  @Patch('reviews/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEducatorReviewDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub; // هات الـuserId من الجارد
    return this.svc.update(userId, id, dto);
  }

  /**
   * 🗑️ حذف تقييم/ريفيو
   * DELETE /educators/reviews/:id
   */
  // @UseGuards(AuthGuard('jwt'))

  /**
   * 📄 قائمة تقييمات مدرس (باجينيشن)
   * GET /educators/:educatorId/reviews?page=&limit=
   */
  @Get(':educatorId/reviews')
  async listForEducator(
    @Param('educatorId', ParseIntPipe) educatorId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.svc.listForEducator(educatorId, page, limit);
  }
}
