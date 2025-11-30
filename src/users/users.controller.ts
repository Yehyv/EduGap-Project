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

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    console.log('IBRAHIIIIIIIIIIIIIIM');
    return this.usersService.findAll();
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
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/profile-images',
        filename: (req, file, cb) => {
          const typedReq = req as AuthenticatedRequest;
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `user-${typedReq.user.sub}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|jpg|gif|webp)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfileImage(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    // لو بتقدم /uploads من الـ ServeStatic فوق
    const relativePath = `/uploads/profile-images/${file.filename}`;

    // ممكن تبني URL كامل (يفضل لو عندك ENV)
    const baseUrl = process.env.APP_URL || ''; // مثال: https://api.taheel-hub.com
    const imageUrl = baseUrl ? `${baseUrl}${relativePath}` : relativePath;
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
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
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
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
