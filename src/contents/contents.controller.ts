/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ContentsService } from './contents.service';
import { CreateContentDto, UpdateContentDto } from './dto/create-content.dto';
import { ContentDetailsService } from './content-details.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@Controller('contents')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService, 
    private readonly contentDetailsService: ContentDetailsService
  ) {}

  /** إنشاء محتوى (بدون أي عزل) */
  @Post()
  create(@Body() dto: CreateContentDto) {
    return this.contentsService.create(dto);
  }

  /** كل المحتويات (فلترة اختيارية باللغة عبر الهيدر languageId) */
  @Get()
  findAll(@Headers('languageId') languageId?: string) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.contentsService.findAll(langId);
  }
  @Get(':id/prerequisites')
  async getPrerequisites(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('languageId') languageId?: number,
    @Query('programId') programId?: number,
  ) {
    const instituteId = req.user?.instituteId; // موجودة لو Logged-in
    const userId = req.user?.sub;
    return this.contentDetailsService.getContentPrerequisites(Number(id), {
      languageId: languageId ? Number(languageId) : undefined,
      instituteId,
      programId: programId ? Number(programId) : undefined,
      userId
    });
  }
  @UseGuards(OptionalJwtAuthGuard)
   @Get(':id/base')
  async getBase(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Headers('languageId') languageId?: string,
    @Query('programId') programId?: string,
  ) {
    const instituteId = req.user?.instituteId;
    return this.contentDetailsService.getBase(Number(id), {
      languageId: languageId ? Number(languageId) : undefined,
      instituteId,
      programId: programId ? Number(programId) : undefined,
    });
  }
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/topics')
  async getTopics(@Param('id') id: string, @Headers('languageId') languageId?: string) {
    return this.contentDetailsService.getTopics(Number(id), { languageId: languageId ? Number(languageId) : undefined });
  }
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/ratings')
  async getRatings(@Param('id') id: string) {
    return this.contentDetailsService.getRatings(Number(id));
  }
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/reviews')
  async getReviews(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.contentDetailsService.getReviews(Number(id), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/access')
  async getAccess(@Param('id') id: string, @Req() req?: AuthenticatedRequest) {
    const userId = req?.user.sub;
    console.log("USER ID IN ACCESS",userId)
    console.log("CONTENT ID IN ACCESS",id)
    console.log("TYPE OF USER ID",typeof userId)
    console.log("TYPE OF CONTENT ID",typeof id)
    return this.contentDetailsService.getAccess(Number(id), { userId });
  }
//   @Get(':id/details')
// getContentDetails(
//   @Param('id', ParseIntPipe) id: number,
//   @Req() req: AuthenticatedRequest,
//   @Query('programId') programId?: string,
//   @Query('reviewPage') reviewPage?: string,
//   @Query('reviewLimit') reviewLimit?: string,
//   @Headers('languageId') languageId?: string,
// ) {
//   const instituteId = req.user?.instituteId;
//   const userId = req.user?.sub;
//   const pid = programId?.trim() ? Number(programId) : undefined;
//   const langId = languageId?.trim() ? Number(languageId) : undefined;

//   return this.contentDetailsService.getDetailsForUser(id, {
//     userId,
//     instituteId,
//     programId: pid,
//     languageId: langId,
//     reviewPage: reviewPage ? Number(reviewPage) : 1,
//     reviewLimit: reviewLimit ? Number(reviewLimit) : 2,
//   });
// }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('trending/paginated')
  async getTrendingPaginated(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
    @Query('programId') programId?: string,
    @Query('page') page?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const pid = programId ? Number(programId) : undefined;
    const pg = page ? Math.max(1, Number(page)) : 1;
    const instituteId = req.user?.instituteId; // موجودة لو Logged-in
    const userId = req.user?.sub;
    console.log("USER ID",userId)
    return this.contentsService.findTrendingPaginated(
      pg,
      8,
      langId,
      instituteId,
      pid,
      userId
    );
  }
  @UseGuards(OptionalJwtAuthGuard)
  /** 🔹 تريندينج — أول 8 فقط (سلايدر) */
  @Get('trending/first-8')
  async getTrendingFirstEight(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
    @Query('programId') programId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const pid = programId ? Number(programId) : undefined;
    const instituteId = req.user?.instituteId;
    const userId = req.user?.sub;

    return this.contentsService.findTrendingFirstEight(
      langId,
      instituteId,
      pid,
      userId
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('latest/paginated')
async getLatestPaginated(
  @Req() req: AuthenticatedRequest,
  @Headers('languageId') languageId?: string,
  @Query('programId') programId?: string,
  @Query('page') page?: string,
) {
  const langId = languageId ? Number(languageId) : undefined;
  const pid = programId ? Number(programId) : undefined;
  const pg = page ? Math.max(1, Number(page)) : 1;
  const instituteId = req.user?.instituteId;
  const userId = req.user?.sub;

  return this.contentsService.findLatestPaginated(
    pg,
    8,
    langId,
    instituteId,
    pid,
    userId, // 👈
  );
}
@UseGuards(JwtAuthGuard)
@Get('latest/first-8')
async getLatestFirstEight(
  @Req() req: AuthenticatedRequest,
  @Headers('languageId') languageId?: string,
  @Query('programId') programId?: string,
) {
  const langId = languageId ? Number(languageId) : undefined;
  const pid = programId ? Number(programId) : undefined;
  const instituteId = req.user?.instituteId;
  const userId = req.user?.sub;

  return this.contentsService.findLatestFirstEight(
    langId,
    instituteId,
    pid,
    userId, // 👈
  );
}
@UseGuards(JwtAuthGuard)
@Get('latest/one')
findLatestOne(
  @Req() req: AuthenticatedRequest,
  @Headers('languageId') languageId?: string,
  @Query('programId') programId?: string,
) {
  const langId = languageId ? Number(languageId) : undefined;
  const pid = programId ? Number(programId) : undefined;
  const instituteId = req.user?.instituteId;
  const userId = req.user?.sub; // ✅ خده من التوكين
  console.log("language ID",langId)
  return this.contentsService.findLatestOneForUser(
    instituteId,
    pid,
    langId,
    userId,
  );
}

  /** محتوى واحد بالتفصيل */
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.contentsService.findOne(id, langId);
  }

  /** تحديث المحتوى/الترجمات */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContentDto,
  ) {
    return this.contentsService.update(id, dto);
  }

  /** ربط المحتوى بكورسات */
  @Patch(':id/course/:courseIds/assign')
  assignToCourses(
    @Param('id', ParseIntPipe) contentId: number,
    @Param('courseIds') courseIds: number[],
  ) {
    return this.contentsService.assignToCourses(contentId, courseIds);
  }

  /** فك الربط بين المحتوى وكورسات */
  @Delete(':id/course/:courseIds/unassign')
  removeFromCourses(
    @Param('id', ParseIntPipe) contentId: number,
    @Param('courseIds') courseIds: number[],
  ) {
    return this.contentsService.removeFromCourses(contentId, courseIds);
  }

  /** حذف (Soft delete) */
  @Delete(':id')
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.contentsService.softDelete(id);
  }

  /** استرجاع محتوى محذوف */
  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.contentsService.restore(id);
  }
  @Post(':id/educator/:educatorId/assign')
  assignEducator(
    @Param('id', ParseIntPipe) id: number,
    @Param('educatorId', ParseIntPipe) educatorId: number,
  ) {
    return this.contentsService.assignEducator(id, educatorId);
  }

  @Delete(':id/educator')
  unassignEducator(@Param('id', ParseIntPipe) id: number) {
    return this.contentsService.unassignEducator(id);
  }

  @Post(':id/educator/restore')
  restoreEducator(
    @Param('id', ParseIntPipe) id: number,
    @Body('educatorId', ParseIntPipe) educatorId: number,
  ) {
    return this.contentsService.restoreEducator(id, educatorId);
  }
  @Get(':id/educator')
  async getEducator(@Param('id') id: string) {
    return this.contentsService.getContentEducator(Number(id));
  }
  @Get(':id/summary')
  async getContentSummary(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
    @Query('programId') programId?: string,
  ) {
    const instituteId = req.user?.instituteId;
    return this.contentDetailsService.getContentSummary(id, {
      languageId: languageId ? Number(languageId) : undefined,
      instituteId,
      programId: programId ? Number(programId) : undefined,
    });
  }
  @UseGuards(JwtAuthGuard)
  @Get('all/nav')
  async contentsNav(
    @Req() req: AuthenticatedRequest,
    @Query('programId') programId?: string,
    @Headers('languageId') languageId?: string,
  ) {
    const instituteId = req.user?.instituteId;
    return this.contentsService.contentsNav({
      instituteId,
      programId: programId ? Number(programId) : undefined,
      languageId: languageId ? Number(languageId) : undefined,
    });
  }
  @UseGuards(JwtAuthGuard) // أو الجارديان عندك
  @Get(':id/next-lesson-id')
  async getNextLessonId(
  @Param('id') id: string,
  @Req() req: AuthenticatedRequest,
) {
  const userId = req.user.sub; // حسب استخراجك لليوزر
  const res = await this.contentDetailsService.getNextOpenLessonId(
    Number(id),
    Number(userId),
  );
  return res;
}

}
