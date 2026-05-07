import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Headers,
  BadRequestException,
  Query,
  Req,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
    role: string;
  };
}
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}
  @Get('overall/:userId')
  async getOverallProgress(@Param('userId', ParseIntPipe) userId: number) {
    return this.dashboardService.getOverallProgressPercentage(userId);
  }
  @Get('passed-exams/:userId')
  async getPassedExams(@Param('userId', ParseIntPipe) userId: number) {
    return this.dashboardService.getPassedExamsCount(userId);
  }
  @Get('student-contents-progress/:userId')
  async getStudentContentsProgress(
    @Param('userId', ParseIntPipe) userId: number,
    @Headers('languageid') languageIdHeader?: string, // e.g. languageId: 1
  ) {
    let languageId: number | undefined = undefined;

    if (languageIdHeader !== undefined) {
      const parsed = Number(languageIdHeader);
      if (Number.isNaN(parsed) || parsed <= 0) {
        throw new BadRequestException('Invalid languageId header');
      }
      languageId = parsed;
    }

    return this.dashboardService.getStudentContentsProgress(userId, languageId);
  }
  @Get('student-courses-progress-summary/:userId')
  async getStudentCoursesOutOfProgramCourses(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.dashboardService.getStudentCoursesOutOfProgramCourses(userId);
  }
  @Get('ai-contents/count')
  @Roles('ADMIN', 'SUPER_ADMIN')
  getAiContentsCount() {
    return this.dashboardService.getAiContentsCount();
  }
  @Get('institutes-expiring-within-month')
  @Roles('ADMIN', 'SUPER_ADMIN')
  institutesExpiringWithinMonth() {
    return this.dashboardService.institutesExpiringWithinMonth();
  }
  @Get('students-without-course-after-3-months')
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN')
  getStudentsWithoutCourseAfterThreeMonths(
    @Req() req?: AuthenticatedRequest,
    @Query('instituteId') instituteIdRaw?: string,
  ) {
    const instituteId =
      instituteIdRaw && !Number.isNaN(Number(instituteIdRaw))
        ? Number(instituteIdRaw)
        : undefined;

    return this.dashboardService.getStudentsWithoutCourseAfterThreeMonths(
      req?.user?.instituteId,
      req?.user?.role,
      instituteId,
    );
  }
  @Get('institutes-with-high-no-course-students')
  @Roles('ADMIN', 'SUPER_ADMIN')
  getInstitutesWithHighNoCourseStudents(
    @Query('threshold') thresholdRaw?: string,
  ) {
    const threshold =
      thresholdRaw && !Number.isNaN(Number(thresholdRaw))
        ? Number(thresholdRaw)
        : 70;

    return this.dashboardService.getInstitutesWithHighNoCourseStudents(
      threshold,
    );
  }
  @Get('top-content-categories-enrollments')
  getTopContentCategoriesEnrollments(
    @Req() req?: AuthenticatedRequest,
    @Headers('languageid') languageIdHeader?: string,
    @Query('limit') limitRaw?: string,
    @Query('instituteId') instituteIdRaw?: string,
  ) {
    let languageId: number | undefined;

    if (languageIdHeader !== undefined) {
      const parsed = Number(languageIdHeader);
      if (Number.isNaN(parsed) || parsed <= 0) {
        throw new BadRequestException('Invalid languageId header');
      }
      languageId = parsed;
    }

    const limit =
      limitRaw && !Number.isNaN(Number(limitRaw)) ? Number(limitRaw) : 5;

    const instituteId =
      instituteIdRaw && !Number.isNaN(Number(instituteIdRaw))
        ? Number(instituteIdRaw)
        : undefined;

    return this.dashboardService.getTopContentCategoriesEnrollments(
      req?.user?.instituteId,
      req?.user?.role,
      languageId,
      limit,
      instituteId,
    );
  }
  @Get('students-activity-trend')
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN')
  getEnrollmentActivityTrend(
    @Req() req?: AuthenticatedRequest,
    @Query('year') yearRaw?: string,
    @Query('instituteId') instituteIdRaw?: string,
  ) {
    const currentYear = new Date().getFullYear();

    const year =
      yearRaw && !Number.isNaN(Number(yearRaw)) ? Number(yearRaw) : currentYear;

    if (year < 2000 || year > currentYear + 1) {
      throw new BadRequestException('Invalid year query parameter');
    }

    const instituteId =
      instituteIdRaw && !Number.isNaN(Number(instituteIdRaw))
        ? Number(instituteIdRaw)
        : undefined;

    return this.dashboardService.getEnrollmentActivityTrend(
      req?.user?.instituteId,
      req?.user?.role,
      year,
      instituteId,
    );
  }

  @Get('program-course-completion')
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  getProgramCourseCompletion(
    @Req() req?: AuthenticatedRequest,
    @Headers('languageId') languageIdRaw?: string,
    @Query('limit') limitRaw?: string,
    @Query('instituteId') instituteIdRaw?: string,
  ) {
    let languageId: number | undefined;

    if (languageIdRaw !== undefined) {
      const parsedLanguageId = Number(languageIdRaw);

      if (Number.isNaN(parsedLanguageId) || parsedLanguageId <= 0) {
        throw new BadRequestException('Invalid languageId header');
      }

      languageId = parsedLanguageId;
    }

    const limit =
      limitRaw && !Number.isNaN(Number(limitRaw)) ? Number(limitRaw) : 5;

    const instituteId =
      instituteIdRaw && !Number.isNaN(Number(instituteIdRaw))
        ? Number(instituteIdRaw)
        : undefined;

    return this.dashboardService.getProgramCourseCompletion(
      req?.user?.instituteId,
      req?.user?.role,
      languageId,
      limit,
      instituteId,
    );
  }
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('top-institutes-engagement')
  getTopInstitutesEngagement(
    @Headers('languageid') languageIdHeader?: string,
    @Query('lim it') limitRaw?: string,
    @Query('instituteId') instituteIdRaw?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    let languageId: number | undefined;

    if (languageIdHeader !== undefined) {
      const parsed = Number(languageIdHeader);

      if (Number.isNaN(parsed) || parsed <= 0) {
        throw new BadRequestException('Invalid languageId header');
      }

      languageId = parsed;
    }

    const limit =
      limitRaw && !Number.isNaN(Number(limitRaw)) ? Number(limitRaw) : 5;

    const selectedInstituteId =
      instituteIdRaw && !Number.isNaN(Number(instituteIdRaw))
        ? Number(instituteIdRaw)
        : undefined;

    return this.dashboardService.getTopInstitutesEngagement(
      req?.user?.instituteId,
      req?.user?.role,
      languageId,
      limit,
      selectedInstituteId,
    );
  }

  @Get('content-completion')
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  getTopContentCompletion(
    @Req() req?: AuthenticatedRequest,
    @Headers('languageId') languageIdRaw?: string,
    @Query('limit') limitRaw?: string,
    @Query('instituteId') instituteIdRaw?: string,
  ) {
    let languageId: number | undefined;

    if (languageIdRaw !== undefined) {
      const parsedLanguageId = Number(languageIdRaw);

      if (Number.isNaN(parsedLanguageId) || parsedLanguageId <= 0) {
        throw new BadRequestException('Invalid languageId header');
      }

      languageId = parsedLanguageId;
    }

    const limit =
      limitRaw && !Number.isNaN(Number(limitRaw)) ? Number(limitRaw) : 10;

    const instituteId =
      instituteIdRaw && !Number.isNaN(Number(instituteIdRaw))
        ? Number(instituteIdRaw)
        : undefined;

    return this.dashboardService.getTopContentCompletion(
      req?.user?.instituteId,
      req?.user?.role,
      languageId,
      limit,
      instituteId,
    );
  }
  @Get('top-faculty-members')
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  getTopFacultyMembersEngagement(
    @Req() req?: AuthenticatedRequest,
    @Query('instituteId') instituteIdRaw?: string,
  ) {
    const instituteId =
      instituteIdRaw && !Number.isNaN(Number(instituteIdRaw))
        ? Number(instituteIdRaw)
        : undefined;

    return this.dashboardService.getTopFacultyMembersEngagement(
      req?.user?.instituteId,
      req?.user?.role,
      instituteId,
    );
  }
  @Get('exam-results/:userId')
  async getPassedExamResults(
    @Param('userId', ParseIntPipe) userId: number,
    @Headers('languageid') languageIdHeader?: string,
  ) {
    let languageId: number | undefined;

    if (languageIdHeader !== undefined) {
      const parsed = Number(languageIdHeader);
      if (Number.isNaN(parsed) || parsed <= 0) {
        throw new BadRequestException('Invalid languageId header');
      }
      languageId = parsed;
    }

    return this.dashboardService.getPassedExamResults(userId, languageId);
  }
  @Get('student-engagement')
  getStudentEngagementTrend(
    @Query('programId') programIdRaw?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const programId =
      programIdRaw && !Number.isNaN(Number(programIdRaw))
        ? Number(programIdRaw)
        : undefined;

    return this.dashboardService.getStudentEngagementTrend(
      programId,
      req?.user?.instituteId,
      req?.user?.role,
    );
  }
  @Get('certificates-issued')
  getCertificatesIssuedTrend(
    @Query('programId') programIdRaw?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const programId =
      programIdRaw && !Number.isNaN(Number(programIdRaw))
        ? Number(programIdRaw)
        : undefined;

    return this.dashboardService.getCertificatesIssuedTrend(
      programId,
      req?.user?.instituteId,
      req?.user?.role,
    );
  }
  @Get('packages-completed')
  getPackagesCompletedTrend(
    @Query('programId') programIdRaw?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const programId =
      programIdRaw && !Number.isNaN(Number(programIdRaw))
        ? Number(programIdRaw)
        : undefined;

    return this.dashboardService.getPackagesCompletedTrend(
      programId,
      req?.user?.instituteId,
      req?.user?.role,
    );
  }
  @Get('institute-overview')
  getInstituteOverview(@Query('instituteId') instituteId: number) {
    const instId = Number(instituteId);
    if (Number.isNaN(instId) || instId <= 0) {
      throw new BadRequestException('Invalid instituteId query parameter');
    }
    return this.dashboardService.getInstituteOverview(instId);
  }
  @Get('student-certificates/:userId')
  async getStudentCertificates(@Param('userId', ParseIntPipe) userId: number) {
    return this.dashboardService.getStudentCertificates(userId);
  }
  @Get('total-institutes')
  @Roles('ADMIN', 'SUPER_ADMIN')
  getTotalInstitutes() {
    return this.dashboardService.getTotalInstitutes();
  }
  @Get('active-students')
  getActiveStudents(@Req() req?: AuthenticatedRequest) {
    return this.dashboardService.getActiveStudents(
      req?.user?.instituteId,
      req?.user?.role,
    );
  }
}
