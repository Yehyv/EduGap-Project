import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin';
import { Request } from 'express';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

interface MyCustomRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: SignInDto) {
    return this.authService.signin(dto.username, dto.password);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  logout(@Req() req: MyCustomRequest) {
    return this.authService.Logout(req.user.sub);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refreshTokens(@Req() req: MyCustomRequest) {
    return this.authService.refreshTokens(req.user.sub, req.user.refreshToken!);
  }

  @UseGuards(AccessTokenGuard)
  @Post('change-password')
  changePassword(
    @Req() req: MyCustomRequest,
    @Body()
    body: { oldPassword: string; newPassword: string; confirmPassword: string },
  ) {
    return this.authService.forceChangePassword(
      req.user.sub,
      body.oldPassword,
      body.newPassword,
      body.confirmPassword,
    );
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { nationalId: string; phone: string }) {
    return this.authService.requestPasswordReset(body.nationalId, body.phone);
  }

  @Post('reset-password')
  @UseGuards(AccessTokenGuard) // نفس الجارد بتاعك اللي بيقرا JWT
  async resetPassword(
    @Req() req: MyCustomRequest,
    @Body() body: { newPassword: string; confirmPassword: string },
  ) {
    const userId = req.user.sub; // جاي من الـ JWT
    return this.authService.resetPasswordAfterOtp(
      userId,
      body.newPassword,
      body.confirmPassword,
    );
  }
}
