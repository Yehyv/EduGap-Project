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
@Roles('ADMIN', 'SUPER_ADMIN', 'INSTITUTE_ADMIN')
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
  @Roles('ADMIN', 'SUPER_ADMIN', 'INSTITUTE_ADMIN', 'INST_ADMIN')
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
  @Roles('ADMIN', 'SUPER_ADMIN', 'INSTITUTE_ADMIN', 'INST_ADMIN')
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
  @Roles('ADMIN', 'SUPER_ADMIN', 'INSTITUTE_ADMIN', 'INST_ADMIN')
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
  @Roles('ADMIN', 'SUPER_ADMIN', 'INSTITUTE_ADMIN')
  @Get('institute-overview')
  getInstituteOverview(@Req() req: AuthenticatedRequest) {
    return this.dashboardService.getInstituteOverview(req.user!.instituteId);
  }
}
