import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SystemAuthService } from './system-auth.service';
import { SystemSignInDto } from './dto/sys-signin';
import { RefreshTokenGuard } from 'src/auth/guards/refresh-token.guard';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
interface MyCustomRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@Controller('system-auth')
export class SystemAuthController {
  constructor(private readonly systemAuthService: SystemAuthService) {}
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: SystemSignInDto) {
    return this.systemAuthService.systemSignin(dto.username, dto.password);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  logout(@Req() req: MyCustomRequest) {
    return this.systemAuthService.logout(req.user.sub);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refreshTokens(@Req() req: MyCustomRequest) {
    return this.systemAuthService.refreshTokens(
      req.user.sub,
      req.user.refreshToken!,
    );
  }
}
