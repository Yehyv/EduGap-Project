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
  BadRequestException,
  Query,
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CertificateLanguage } from './entities/certificate.entity';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
    role: string;
  };
}
@UseGuards(JwtAuthGuard)
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('contents/:contentId/certificates')
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
  @Post('packages/:packageId/certificates')
  async generatePackageCertificates(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new Error('User not authenticated');
    const data = await this.certificatesService.generatePackageCertificates(
      packageId,
      userId,
    );

    return {
      status: 200,
      message: 'Package certificates generated successfully',
      data,
    };
  }
  @Get('content-certificates')
  async getUserContentCertificates(
    @Req() req: AuthenticatedRequest,
    @Query('language') language?: string,
  ) {
    const userId = Number(req.user?.sub);

    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    let parsedLanguage: CertificateLanguage | undefined;

    if (language) {
      const normalizedLanguage = language.trim().toLowerCase();

      if (
        normalizedLanguage !== CertificateLanguage.AR &&
        normalizedLanguage !== CertificateLanguage.EN
      ) {
        throw new BadRequestException('language must be ar or en');
      }

      parsedLanguage = normalizedLanguage as CertificateLanguage;
    }

    const data = await this.certificatesService.getUserContentCertificates(
      userId,
      parsedLanguage,
    );

    return {
      status: 200,
      message: 'User content certificates fetched successfully',
      data,
    };
  }
  @Get('package-certificates')
  async getUserPackageCertificates(
    @Req() req: AuthenticatedRequest,
    @Query('language') language?: string,
  ) {
    let parsedLanguage: CertificateLanguage | undefined;
    const userId = req.user?.sub;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    if (language) {
      const normalizedLanguage = language.trim().toLowerCase();

      if (
        normalizedLanguage !== CertificateLanguage.AR &&
        normalizedLanguage !== CertificateLanguage.EN
      ) {
        throw new BadRequestException('language must be ar or en');
      }

      parsedLanguage = normalizedLanguage as CertificateLanguage;
    }

    const data = await this.certificatesService.getUserPackageCertificates(
      userId,
      parsedLanguage,
    );

    return {
      status: 200,
      message: 'User package certificates fetched successfully',
      data,
    };
  }
  @Get('dashboard/certificates')
  async getUserCertificatesSummary(
    @Req() req: AuthenticatedRequest,
    @Query('language') language?: string,
  ) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    let parsedLanguage: CertificateLanguage | undefined;

    if (language) {
      const normalizedLanguage = language.trim().toLowerCase();

      if (
        normalizedLanguage !== CertificateLanguage.AR &&
        normalizedLanguage !== CertificateLanguage.EN
      ) {
        throw new BadRequestException('language must be ar or en');
      }

      parsedLanguage = normalizedLanguage as CertificateLanguage;
    }

    const data = await this.certificatesService.getUserCertificatesSummary(
      Number(userId),
      parsedLanguage,
    );

    return {
      status: 200,
      message: 'User certificates fetched successfully',
      data,
    };
  }
}
