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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
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

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}
  @Get('visitors/first-8')
  findFirstEightForVisitors(@Headers('languageId') languageId?: string) {
    const langId = languageId !== undefined ? +languageId : 0;
    return this.coursesService.findFirstEightForVisitors(langId);
  }
  @Get('visitors')
  findAllForVisitors(
    @Headers('languageId') languageId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 8,
  ) {
    const langId = languageId !== undefined ? +languageId : 0;
    return this.coursesService.findAllForVisitors(langId, page, limit);
  }
  @Post()
  @UseGuards(JwtAuthGuard) // فعّل الـ Guard
  create(
    @Body() createCourseDto: CreateCourseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.coursesService.create(createCourseDto, req.user.instituteId);
  }

  @Get()
  @UseGuards(JwtAuthGuard) // فعّل الـ Guard
  findAll(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 8,
  ) {
    const langId = languageId !== undefined ? +languageId : 0;
    return this.coursesService.findAll(
      req.user.instituteId,
      langId,
      page,
      limit,
    );
  }

  @Get('first-eight') // هذا لازم يجي قبل :id
  @UseGuards(JwtAuthGuard) // فعّل الـ Guard
  findFirstEight(
    @Req() req: AuthenticatedRequest,
    @Query('languageId') languageId?: number,
  ) {
    return this.coursesService.findFirstEight(req.user.instituteId, languageId);
  }

  @Get('filter') // هذا كمان لازم يجي قبل :id
  @UseGuards(JwtAuthGuard) // فعّل الـ Guard
  findByPrograms(
    @Req() req: AuthenticatedRequest,
    @Query('programIds') programIds: string, // programIds=1,2,3
    @Query('languageId') languageId?: number,
  ) {
    const ids = programIds.split(',').map((id) => parseInt(id, 10));
    return this.coursesService.findByPrograms(
      ids,
      req.user.instituteId,
      languageId,
    );
  }
  @Get('popular')
  async getPopularCourses(@Query('limit') limit?: number) {
    const parsedLimit = limit ? Number(limit) : 10;
    return this.coursesService.getPopularCourses(parsedLimit);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard) // فعّل الـ Guard
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId !== undefined ? +languageId : 0;
    if (langId) {
      return this.coursesService.findOne(+id, req.user.instituteId, langId);
    }
    return this.coursesService.findOne(+id, req.user.instituteId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard) // فعّل الـ Guard
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.coursesService.update(
      +id,
      updateCourseDto,
      req.user.instituteId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard) // فعّل الـ Guard
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.coursesService.remove(+id, req.user.instituteId);
  }

  @Patch(':id/programs')
  assignToPrograms(
    @Param('id', ParseIntPipe) courseId: number,
    @Body('programIds') programIds: number[],
    @Req() req: AuthenticatedRequest,
  ) {
    return this.coursesService.assignToPrograms(
      courseId,
      programIds,
      req.user.instituteId,
    );
  }

  @Delete(':id/programs')
  removeFromPrograms(
    @Param('id', ParseIntPipe) courseId: number,
    @Body('programIds') programIds: number[],
    @Req() req: AuthenticatedRequest,
  ) {
    return this.coursesService.removeFromPrograms(
      courseId,
      programIds,
      req.user.instituteId,
    );
  }
}
