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
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';

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
}
