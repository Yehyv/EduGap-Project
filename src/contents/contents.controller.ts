import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  UseGuards,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { ContentsService } from './contents.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

// اضافة الـ interface للـ Request
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
  constructor(private readonly contentsService: ContentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // فعّل الـ Guard
  create(
    @Body() createContentDto: CreateContentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.contentsService.create(createContentDto, req.user.instituteId);
  }

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId !== undefined ? +languageId : 0;
    const userInstituteId = req.user ? req.user.instituteId : undefined;

    return this.contentsService.findAll(userInstituteId, langId);
  }
  @Get('first-8')
  findFirestEight(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId !== undefined ? +languageId : 0;
    const userInstituteId = req.user ? req.user.instituteId : undefined;
    return this.contentsService.findFirstEight(userInstituteId, langId);
  }

  @Get('filter') // هذا لازم يجي قبل :id
  findByCourses(
    @Req() req: AuthenticatedRequest,
    @Query('courseIds') courseIds: string, // courseIds=1,2,3
    @Query('languageId') languageId?: number,
  ) {
    const ids = courseIds.split(',').map((id) => parseInt(id, 10));
    return this.contentsService.findByCourses(
      ids,
      req.user.instituteId,
      languageId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId !== undefined ? +languageId : 0;
    if (langId) {
      return this.contentsService.findOne(+id, req.user.instituteId, langId);
    }
    return this.contentsService.findOne(+id, req.user.instituteId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContentDto: UpdateContentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.contentsService.update(
      +id,
      updateContentDto,
      req.user.instituteId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.contentsService.remove(+id, req.user.instituteId);
  }

  @Patch(':id/courses')
  assignToCourses(
    @Param('id', ParseIntPipe) contentId: number,
    @Body('courseIds') courseIds: number[],
    @Req() req: AuthenticatedRequest,
  ) {
    return this.contentsService.assignToCourses(
      contentId,
      courseIds,
      req.user.instituteId,
    );
  }

  @Delete(':id/courses')
  removeFromCourses(
    @Param('id', ParseIntPipe) contentId: number,
    @Body('courseIds') courseIds: number[],
    @Req() req: AuthenticatedRequest,
  ) {
    return this.contentsService.removeFromCourses(
      contentId,
      courseIds,
      req.user.instituteId,
    );
  }
}
