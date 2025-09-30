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

// اعمل interface خاص بيك للـ Request اللي فيه user
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
  @Post('login')
  signin(@Body() dto: SignInDto, @Headers('languageId') languageId?: string) {
    const langId = languageId !== undefined ? +languageId : 0;
    return this.authService.Signin(dto, langId);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  logout(@Req() req: MyCustomRequest) {
    // دلوقتي TypeScript شايف req.user عادي
    return this.authService.Logout(req.user.sub);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refreshTokens(@Req() req: MyCustomRequest) {
    // وهنا كمان شايف req.user.refreshToken
    return this.authService.refreshTokens(req.user.sub, req.user.refreshToken!);
  }
}
