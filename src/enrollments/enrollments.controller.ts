import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RateEnrollmentDto } from './dto/create-enrollment.dto';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}
  @Post(':courseId/enroll')
  enrollStudentCourse(
    @Req() req: AuthenticatedRequest,
    @Param('courseId') courseId: number,
  ) {
    return this.enrollmentsService.enrollStudentContent(
      courseId,
      req.user.sub,
      req.user.instituteId,
    );
  }
  @Delete(':courseId/unenroll')
  unenrollStudentCourse(
    @Req() req: AuthenticatedRequest,
    @Param('courseId') courseId: number,
  ) {
    return this.enrollmentsService.unenrollStudentContent(
      courseId,
      req.user.sub,
    );
  }
  /** 🔹 تقييم المحتوى (rating 1..5) */
  @Post(':contentId/rate')
  async rateContent(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: RateEnrollmentDto,
  ) {
    return this.enrollmentsService.rateContent(contentId, req.user.sub, dto);
  }

  @Get('my-courses')
  getUserEnrollments(@Req() req: AuthenticatedRequest) {
    return this.enrollmentsService.getUserEnrollments(req.user.sub);
  }

  // Get all users enrolled in a course
  @Get(':contentId/users')
  getContentEnrollments(@Param('contentId') contentId: number) {
    return this.enrollmentsService.getContentEnrollments(contentId);
  }

  @Get('contents/:contentId/my-rating')
  @UseGuards(JwtAuthGuard)
  getMyRating(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.enrollmentsService.getUserRate(contentId, req.user.sub);
  }
}
