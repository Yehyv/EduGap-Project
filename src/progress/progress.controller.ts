import { Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}
  @Post('lesson/:id/start')
  startLesson(@Req() req: AuthenticatedRequest, @Param('id') id: number) {
    return this.progressService.startLesson(
      id,
      req.user.sub,
      req.user.instituteId,
    );
  }
  @Post('lesson/:id/complete')
  completeLesson(@Req() req: AuthenticatedRequest, @Param('id') id: number) {
    return this.progressService.completeLesson(
      id,
      req.user.sub,
      req.user.instituteId,
    );
  }
}