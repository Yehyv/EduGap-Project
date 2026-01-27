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
  Req,
  UseGuards,
  ForbiddenException,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersOtpService } from 'src/users-otp/users-otp.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import { imageStorage } from 'src/common/helpers/upload.helper';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersOtpService: UsersOtpService,
  ) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('super-admin/users-list')
  findAll() {
    console.log('IBRAHIIIIIIIIIIIIIIM');
    return this.usersService.findAll();
  }
  @Patch('super-admin/user-status/:id')
  async changeUserStatus(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.toggleActive(id);
  }
  @Get('super-admin/institute/:instituteId/students')
  async getStudentsForInstitute(
    @Param('instituteId', ParseIntPipe) instituteId: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return {
      status: 200,
      message: 'Request successful',
      data: await this.usersService.studentsForInst(instituteId, langId),
    };
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMeMinimal(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.usersService.getMeMinimal(req.user.sub, langId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getUserProfile(@Req() req: AuthenticatedRequest) {
    return this.usersService.getProfileInfo(req.user.sub);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('profile/image')
  @UseInterceptors(FileInterceptor('image', imageStorage('profile-images')))
  async uploadProfileImage(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const relativePath = `/uploads/profile-images/${file.filename}`;
    const baseUrl = process.env.APP_URL || '';
    const imageUrl = baseUrl + relativePath;

    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException();

    return this.usersService.changeProfileImage(userId, imageUrl);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    console.log('=== Controller.findById ===');
    console.log('Received ID:', id);

    try {
      const result = await this.usersService.findById(id);
      console.log('Controller returning:', result.id);
      return result;
    } catch (error) {
      console.log('Error in controller:', error.message);
      throw error; // إعادة throw عشان الـ Exception Filter يشتغل
    }
  }
  @Get('super-admin/user/:id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.usersService.findOne(id, langId);
  }
  @Patch('super-admin/:id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete('super-admin/:id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(+id);
  }
  @Patch(':id/assign-institute/:instituteId')
  async assignUserToInstitute(
    @Param('id') userId: number,
    @Param('instituteId') instituteId: number,
  ) {
    return this.usersService.assignUserToInstitute(userId, instituteId);
  }
  // @Post('change-password')
  // async changePassword(
  //   @Body()
  //   body: {
  //     userId: number;
  //     oldPassword: string;
  //     newPassword: string;
  //     confirmPassword: string;
  //   },
  // ) {
  //   return this.usersService.changePassword(
  //     body.userId,
  //     body.oldPassword,
  //     body.newPassword,
  //     body.confirmPassword,
  //   );
  // }
  @UseGuards(JwtAuthGuard)
  @Post('profile/change-name')
  async changeName(
    @Body('newName') newName: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.changeName(req.user.sub, newName);
  }
  @Patch(':id/assign-program/:programId')
  assignUserToProgram(
    @Param('id', ParseIntPipe) userId: number,
    @Param('programId', ParseIntPipe) programId: number,
  ) {
    return this.usersService.assignUserToProgram(userId, programId);
  }
  @UseGuards(JwtAuthGuard)
  @Post('profile/change-phone/request')
  async requestChangePhone(
    @Body('newPhone') newPhone: string,
    @Req() req: AuthenticatedRequest,
  ) {
    // نجيب اليوزر عشان نمرره للـ OTP service
    const user = await this.usersService.findById(req.user.sub);

    // نولّد OTP مخصوص للـ CHANGE_PHONE و نبعت على الرقم الجديد (smsPhone)
    const otp = await this.usersOtpService.generateOtpForChangePhone(
      user,
      newPhone,
    );

    return {
      message: 'OTP sent to your new phone',
      challengeId: otp.challengeId,
      ...(process.env.OTP_STATS === 'true' ? { code: otp.code } : {}),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/change-phone/verify')
  async verifyChangePhone(
    @Body()
    body: {
      challengeId: string;
      code: string;
      newPhone: string;
    },
    @Req() req: AuthenticatedRequest,
  ) {
    const { challengeId, code, newPhone } = body;

    // 1) نتحقق من الـ OTP ونتأكد إن الـ purpose = CHANGE_PHONE
    const { userId: otpUserId } =
      await this.usersOtpService.verifyOtpForChangePhone(challengeId, code);

    // 2) نتأكد إن اليوزر اللي بيحاول يغيّر هو نفس صاحب الـ OTP
    if (otpUserId !== req.user.sub) {
      throw new ForbiddenException('You cannot use this OTP');
    }

    // 3) نغيّر الرقم فعلًا (مع كل الـ validation جوه UsersService.changePhone)
    return this.usersService.changePhone(req.user.sub, newPhone);
  }
}
