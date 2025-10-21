/* eslint-disable prettier/prettier */
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
  UseGuards,
  Req,
} from '@nestjs/common';
import { ContentReviewsService } from './content-reviews.service';
import { CreateContentReviewDto } from './dto/create-content-review.dto';
import { UpdateContentReviewDto } from './dto/update-content-review.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;          // userId
    email: string;
    instituteId: number;  // لعزل المعهد
    refreshToken?: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('content-reviews')
export class ContentReviewsController {
  constructor(private readonly contentReviewsService: ContentReviewsService) {}

  /**
   * POST /content-reviews/:contentId
   * إنشاء ريفيو لمحتوى (يتحقق من انتماء المحتوى لمعهد المستخدم عبر IPC)
   */
  @Post(':contentId')
  create(
    @Req() req: AuthenticatedRequest,
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body() dto: CreateContentReviewDto,
  ) {
    return this.contentReviewsService.create(
      contentId,
      req.user!.sub,
      req.user!.instituteId,
      dto,
    );
  }

  /**
   * GET /content-reviews/content/:contentId?page=&pageSize=
   * جلب كل الريفيوز على محتوى معيّن (مع عزل المعهد) + Pagination
   */
  @Get('content/:contentId')
  findByContent(
    @Req() req: AuthenticatedRequest,
    @Param('contentId', ParseIntPipe) contentId: number,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const p = page ? Number(page) : 1;
    const ps = pageSize ? Number(pageSize) : 10;
    return this.contentReviewsService.findByContent(
      contentId,
      req.user!.instituteId,
      p,
      ps,
    );
  }

  /**
   * GET /content-reviews/me?page=&pageSize=
   * ريفيوهات المستخدم نفسه
   */
  @Get('me')
  findMyReviews(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const p = page ? Number(page) : 1;
    const ps = pageSize ? Number(pageSize) : 10;
    return this.contentReviewsService.findMyReviews(req.user!.sub, p, ps);
  }

  /**
   * PATCH /content-reviews/:id
   * تعديل ريفيو — مالك الريفيو فقط
   */
  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContentReviewDto,
  ) {
    return this.contentReviewsService.update(id, req.user!.sub, dto);
  }

  /**
   * DELETE /content-reviews/:id
   * حذف ريفيو (Soft) — مالك الريفيو فقط
   */
  @Delete(':id')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.contentReviewsService.remove(id, req.user!.sub);
  }
}
