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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageStorage } from 'src/common/helpers/upload.helper';

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
  @UseInterceptors(
    FileInterceptor(
      'image',
    imageStorage('course-images'),
    )
  )
  create(@Body() dto: CreateCourseDto, @UploadedFile() image?: Express.Multer.File) {
    return this.coursesService.create(dto, image);
  }

  @Get('super-admin/courses-list')
  getCoursesListForAdmin( @Headers('languageId') languageId?: string,) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.coursesService.findAll(langId);
  }
  @Get('super-admin/dropdown/list')
  courseDropDown(
    @Headers('languageId') languageId: number | undefined,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.coursesService.courseDropDown(langId);
  }
  @Get('super-admin/dropdown/list/program')
  courseProgramDropDown(
    @Headers('languageId') languageId: number | undefined,
    @Query('programId') programId: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const pid = programId ? Number(programId) : undefined;
    if (!pid) throw new BadRequestException('programId is required');
    return this.coursesService.courseProgramDropDown(pid, langId);
  }

  /** جميع كورسات المعهد الحالي (من IPC) */
  @Get()
  findAllCoursesForInstitute(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.coursesService.findAllCoursesForInstitute(req.user!.instituteId, langId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('all/nav')
coursesNav(
  @Req() req: AuthenticatedRequest,
  @Query('programId', ParseIntPipe) programId: number,
  @Headers('languageId') languageId?: number,
) {
  const instituteId = req.user!.instituteId;
  return this.coursesService.coursesNav(
    instituteId, programId, {
    languageId: languageId ? Number(languageId) : undefined,
  });
}

  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @Get('super-admin/course/:id')
  getCourseForAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Headers('languageId') languageId?: string,
  ){
    const langId = languageId ? Number(languageId) : undefined;
    return this.coursesService.findOne(id, langId);
  }
  @Patch('super-admin/course-status/:id')
  async changeCourseStatus(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.toggleActive(id);
  }
  /** كورس واحد (مع العزل بالمعهد) */
  @Get(':id')
  findCourseForInstitute(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.coursesService.findCourseForInstitute(id, req.user!.instituteId, langId);
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
  @Patch('super-admin/:id')
  @UseInterceptors(
    FileInterceptor(
      'image',
      imageStorage('course-images'),
    )
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    return this.coursesService.update(id, dto, image);
  }

  /** حذف كورس (Soft delete) */
  @Delete('super-admin/:id')
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
@UseGuards(OptionalJwtAuthGuard)
@Get(':courseId/basic')
  async getCourseBasicById(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageIdRaw?: string,
    @Query('programId') programIdRaw?: string,
  ) {
    const languageId = languageIdRaw !== undefined ? Number(languageIdRaw) : undefined;
    const instituteId = req?.user?.instituteId
      ? Number(req.user.instituteId)
      : undefined;
    const programId = programIdRaw !== undefined ? Number(programIdRaw) : undefined;

    return this.coursesService.getCourseBasicById(courseId, {
      languageId,
      instituteId,
      programId,
    }, req.user?.sub
  );
  }
  @UseGuards(OptionalJwtAuthGuard)
  // GET /courses/:courseId/contents?page=&limit=&languageId=&instituteId=&programId=&userId=
  @Get(':courseId/contents')
  async getCourseContentsPaginated(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: AuthenticatedRequest,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
    @Headers('languageId') languageIdRaw?: string,
    @Query('programId') programIdRaw?: string,
  ) {
    const page = pageRaw ? Number(pageRaw) : undefined;         // الخدمة عندك فيها قيم افتراضية
    const limit = limitRaw ? Number(limitRaw) : undefined;
    const languageId = languageIdRaw !== undefined ? Number(languageIdRaw) : undefined;
    const instituteId = req?.user?.instituteId
      ? Number(req.user.instituteId)
      : undefined;
    const programId = programIdRaw !== undefined ? Number(programIdRaw) : undefined;
    const userId = req?.user?.sub ? Number(req.user.sub) : undefined;

    return this.coursesService.getCourseContentsPaginated(courseId, {
      page,
      limit,
      languageId,
      instituteId,
      programId,
      userId,
    });
  }
}
