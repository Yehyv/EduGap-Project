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
  Query,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersOtpService } from 'src/users-otp/users-otp.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { imageStorage } from 'src/common/helpers/upload.helper';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserActivationDto } from './dto/user-activation.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import express from 'express';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
    role: string;
  };
}
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersOtpService: UsersOtpService,
  ) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN')
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.create(createUserDto, req.user.sub);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN')
  @Post('student')
  createStudent(
    @Body() CreateStudDto: CreateStudentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.createStudent(CreateStudDto, req.user.sub);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('super-admin/users-list')
  findAll(
    @Headers('languageId') languageId?: string,
    @Query('roleCategory') roleCategory?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('instituteId') instituteId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const role_cat = roleCategory ? Number(roleCategory) : undefined;
    const instId = instituteId ? Number(instituteId) : undefined;

    return this.usersService.findAll(
      role_cat,
      langId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
      instId,
    );
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN')
  @Get('super-admin/students/count')
  countStudents(
    @Query('instituteId') instituteIdRaw?: string,
    @Query('programId') programIdRaw?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const instituteId =
      instituteIdRaw && !Number.isNaN(Number(instituteIdRaw))
        ? Number(instituteIdRaw)
        : undefined;

    const programId =
      programIdRaw && !Number.isNaN(Number(programIdRaw))
        ? Number(programIdRaw)
        : undefined;

    return this.usersService.countStudents(
      instituteId,
      programId,
      req?.user?.instituteId,
      req?.user?.role,
    );
  }
    @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post(':id/activate')
  async activateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body: UserActivationDto,
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const systemUserId = req.user.sub;

    return this.usersService.activateUser(
      userId,
      systemUserId,
      body,
      languageId ? Number(languageId) : undefined,
    );
  }

  // 🔴 Deactivate User
    @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post(':id/deactivate')
  async deactivateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body: UserActivationDto,
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const systemUserId = req.user.sub;

    return this.usersService.deactivateUser(
      userId,
      systemUserId,
      body,
      languageId ? Number(languageId) : undefined,
    );
  }
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('students/export')
  async exportUsers(
    @Res() res: express.Response,
    @Query('instituteId') instituteId?: string,
    @Headers('languageId') languageId?: string,
  ) {
    if (!instituteId) {
      throw new BadRequestException('instituteId is required');
    }

    return this.usersService.exportUsersToExcel(
      res,
      Number(instituteId),
      languageId ? Number(languageId) : undefined,
    );
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN')
  @Get('super-admin/institute/:instituteId/students')
  async getStudentsForInstitute(
    @Param('instituteId', ParseIntPipe) instituteId: number,
    @Headers('languageId') languageId?: string,
    @Query('programId') programId?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string, // 👈 الجديد
  ) {
    return this.usersService.studentsForInst(
      instituteId,
      languageId ? Number(languageId) : undefined,
      programId ? Number(programId) : undefined,
      isActive ? Number(isActive) : undefined,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
    );
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN')
  @Get('super-admin/institute/:instituteId/stuff')
  async getStuffForInstitute(
    @Param('instituteId', ParseIntPipe) instituteId: number,
    @Headers('languageId') languageId?: string,
    @Query('programId') programId?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string, // 👈 الجديد
  ) {
    return {
      status: 200,
      message: 'Request successful',
      data: await this.usersService.stuffForInstitute(
        instituteId,
        languageId ? Number(languageId) : undefined,
        programId ? Number(programId) : undefined,
        isActive ? Number(isActive) : undefined,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10,
        search,
      ),
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN')
  @Get('super-admin/user/:id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.usersService.findOne(id, langId);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN')
  @Patch('super-admin/:id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN')
  @Delete('super-admin/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN')
  @Patch(':id/assign-program/:programId')
  assignUserToProgram(
    @Param('id', ParseIntPipe) userId: number,
    @Param('programId', ParseIntPipe) programId: number,
    @Query('instituteId', ParseIntPipe) instituteId: number,
  ) {
    const instId = Number(instituteId);
    const progId = Number(programId);
    const userIdNum = Number(userId);
    return this.usersService.assignUserToProgram(userIdNum, progId, instId);
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
