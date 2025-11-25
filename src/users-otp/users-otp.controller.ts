import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersOtpService } from './users-otp.service';
import { CreateUsersOtpDto } from './dto/create-users-otp.dto';
import { UpdateUsersOtpDto } from './dto/update-users-otp.dto';

@Controller('users-otp')
export class UsersOtpController {
  constructor(private readonly usersOtpService: UsersOtpService) {}

  @Post('verify-otp')
  async verifyOtp(@Body() body: { challengeId: string; code: string }) {
    return this.usersOtpService.verifyOtpForChangePassword(
      body.challengeId,
      body.code,
    );
  }

  @Post('resend-otp')
  async resendOtp(@Body() body: { challengeId: string }) {
    return this.usersOtpService.resendOtp(body.challengeId);
  }
}
