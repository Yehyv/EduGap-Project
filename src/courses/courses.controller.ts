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
  UseGuards,
  ParseIntPipe,
  Req,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}

// @UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  /** إنشاء كورس عام (بدون ربط بمعهد/برنامج) */
  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  /** جميع كورسات المعهد الحالي (من IPC) */
  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.coursesService.findAll(req.user!.instituteId, langId);
  }

  @Get('first-8')
  async findInstituteProgramCoursesFirstEight(
    @Req() req: AuthenticatedRequest,
    @Query('programId') programId?: string,
    @Headers('languageId') languageId?: string,
  ) {
    const instituteId = req.user?.instituteId;
    if (!instituteId) throw new BadRequestException('Missing instituteId');

    // نقرأ programId من الـ query أو من التوكن لو موجود
    const pid = programId ? Number(programId) : undefined;
    if (!pid) throw new BadRequestException('programId is required');

    const langId = languageId ? Number(languageId) : undefined;

    return this.coursesService.findInstituteProgramCoursesFirstEight(
      instituteId,
      pid,
      langId,
    );
  }

  /** مقررات المعهد+البرنامج (Paginated 8) */
  @Get('paginated')
  async findInstituteProgramCoursesPaginated(
    @Req() req: AuthenticatedRequest,
    @Query('programId') programId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Headers('languageId') languageId?: string,
  ) {
    const instituteId = req.user?.instituteId;
    if (!instituteId) throw new BadRequestException('Missing instituteId');

    const pid = programId ? Number(programId) : undefined;

    if (!pid) throw new BadRequestException('programId is required');

    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 8;
    const langId = languageId ? Number(languageId) : undefined;

    return this.coursesService.findInstituteProgramCoursesPaginated(
      instituteId,
      pid,
      langId,
      p,
      l,
    );
  }

  /** كورس واحد (مع العزل بالمعهد) */
  @Get(':id')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.coursesService.findOne(id, req.user!.instituteId, langId);
  }

  /** كورسات برنامج معيّن (كتالوج عام من PC) */
  @Get('by-program/:programId')
  findByProgram(
    @Param('programId', ParseIntPipe) programId: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.coursesService.findByProgram(programId, langId);
  }

  /** تحديث كورس (للأدمن) */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, dto);
  }

  /** حذف كورس (Soft delete) */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }

  /** ربط كورس ببرنامج عام (PC) */
  @Patch(':courseId/programs/:programId')
  assignCourseToProgram(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('programId', ParseIntPipe) programId: number,
  ) {
    return this.coursesService.assignCourseToProgram(programId, courseId);
  }

  /** ربط كورس ببرنامج مربوط بمعهد (IPC) */
  @Patch(':courseId/programs/:programId/institutes/:instituteId')
  assignCourseToInstituteProgram(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('programId', ParseIntPipe) programId: number,
    @Param('instituteId', ParseIntPipe) instituteId: number,
  ) {
    return this.coursesService.assignCourseToInstituteProgram(
      instituteId,
      programId,
      courseId,
    );
  }

  /** فك ربط كورس من برنامج عام (PC) */
@Delete(':courseId/programs/:programId')
removeCourseFromProgram(
  @Param('courseId', ParseIntPipe) courseId: number,
  @Param('programId', ParseIntPipe) programId: number,
) {
  return this.coursesService.removeCourseFromProgram(programId, courseId);
}

/** فك ربط كورس من برنامج تابع لمعهد (IPC) */
@Delete(':courseId/programs/:programId/institutes/:instituteId')
removeCourseFromInstituteProgram(
  @Param('courseId', ParseIntPipe) courseId: number,
  @Param('programId', ParseIntPipe) programId: number,
  @Param('instituteId', ParseIntPipe) instituteId: number,
) {
  return this.coursesService.removeCourseFromInstituteProgram(
    instituteId,
    programId,
    courseId,
  );
}
}
