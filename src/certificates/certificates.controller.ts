import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
    role: string;
  };
}
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}
  @UseGuards(JwtAuthGuard)
  @Post(':contentId/certificates')
  async generateCertificates(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new Error('User not authenticated');

    const certificates =
      await this.certificatesService.generateContentCertificates(
        contentId,
        userId,
      );

    return {
      status: 200,
      message: 'Certificates generated successfully',
      data: certificates,
    };
  }
}
