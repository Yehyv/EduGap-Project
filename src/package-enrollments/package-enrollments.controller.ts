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
  Headers,
} from '@nestjs/common';
import { PackageEnrollmentsService } from './package-enrollments.service';
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
@Controller('package-enrollments')
export class PackageEnrollmentsController {
  constructor(
    private readonly packageEnrollmentsService: PackageEnrollmentsService,
  ) {}
  // تأكد أن المستخدم مصدق قبل السماح له بالوصول
  @Post(':packageId/enroll')
  async enrollPackage(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub; // حسب authentication
    if (!userId) throw new Error('User not authenticated');

    return this.packageEnrollmentsService.enrollUserToPackage(
      packageId,
      userId,
    );
  }

  /**
   * 2️⃣ Unenroll a user from a package
   */
  @Delete(':packageId/unenroll')
  async unenrollPackage(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new Error('User not authenticated');

    return this.packageEnrollmentsService.unenrollUserFromPackage(
      packageId,
      userId,
    );
  }

  /**
   * 3️⃣ Get all contents enrolled by the user in a package
   */
  @Get(':packageId/contents')
  async getPackageContentsEnrollment(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new Error('User not authenticated');
    const langId = languageId ? parseInt(languageId) : undefined;
    return this.packageEnrollmentsService.getPackageContentsEnrollment(
      packageId,
      userId,
      langId,
    );
  }

  /**
   * 4️⃣ Check if user completed all contents in a package (ready for certificate)
   */
  @Get(':packageId/completion-status')
  async checkPackageCompletion(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new Error('User not authenticated');
    const langId = languageId ? parseInt(languageId) : undefined;
    return this.packageEnrollmentsService.checkCompletion(
      packageId,
      userId,
      langId,
    );
  }
  // @Patch(':packageEnrollmentId/update-status')
  // async updatePackageStatus(
  //   @Param('packageEnrollmentId', ParseIntPipe) packageEnrollmentId: number,
  //   @Req() req: AuthenticatedRequest,
  // ) {
  //   // اختياري: ممكن تتحقق إن المستخدم تابع له الباكيدج
  //   const userId = req.user?.sub;
  //   if (!userId) throw new Error('User not authenticated');

  //   const allCompleted =
  //     await this.packageEnrollmentsService.updatePackageStatus(
  //       packageEnrollmentId,
  //     );

  //   return {
  //     status: 200,
  //     message: 'Package status updated successfully',
  //     data: {
  //       packageEnrollmentId,
  //       allCompleted,
  //     },
  //   };
  // }
}
