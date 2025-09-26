import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dto/signin';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from './types/tokens.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async Signin(dto: SignInDto): Promise<Tokens> {
    // Better validation
    if (
      typeof dto.email !== 'string' ||
      dto.email.trim() === '' ||
      typeof dto.password !== 'string' ||
      dto.password.trim() === ''
    ) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.userService.findByEmail(dto.email.trim());
    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    // Ensure password exists and is a string
    if (!user.password || typeof user.password !== 'string') {
      throw new ForbiddenException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new ForbiddenException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email, user.instituteId);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async Logout(userId: number | string) {
    await this.userService.update(+userId, { refreshToken: null });
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.userService.findById(userId);

    // التحقق من وجود المستخدم والـ refresh token
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    // التحقق من صحة الـ refresh token
    const isMatch = await bcrypt.compare(rt, user.refreshToken);
    if (!isMatch) {
      throw new ForbiddenException('Access Denied');
    }
    const tokens = await this.getTokens(user.id, user.email, user.instituteId);
    await this.userService.update(user.id, {
      refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
    });
    return tokens;
    // هنا الجزء المهم: محو الـ refresh token القديم فور التحقق منه
    // هذا يضمن عدم إمكانية استخدامه مرة أخرى
    // await this.userService.update(user.id, { refreshToken: null });
    // const updatedUser = await this.userService.findById(userId);
    // console.log('UPDATED REFRESH TOKEN', updatedUser.refreshToken);
    // try {
    //   // إنشاء tokens جديدة
    //   const tokens = await this.getTokens(updatedUser.id, updatedUser.email, updatedUser.instituteId);

    //   // حفظ الـ refresh token الجديد
    //   await this.updateRefreshToken(updatedUser.id, tokens.refreshToken);

    //   return tokens;
    // } catch (error) {
    //   // في حالة حدوث خطأ، تأكد من أن الـ refresh token محذوف
    //   await this.userService.update(updatedUser.id, { refreshToken: null });

    //   throw new ForbiddenException('Token refresh failed');
    // }
  }

  // دالة إضافية للتحقق من صلاحية الـ refresh token دون استخدامه
  async validateRefreshToken(userId: number, rt: string): Promise<boolean> {
    const user = await this.userService.findById(userId);

    if (!user || !user.refreshToken) {
      return false;
    }

    return await bcrypt.compare(rt, user.refreshToken);
  }

  async getTokens(
    userId: number,
    email: string,
    instituteId: number,
  ): Promise<Tokens> {
    const payload = { sub: userId, email, instituteId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_TOKEN as string,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET as string,
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.update(userId, { refreshToken: hashedToken });
  }

  // دالة إضافية لمحو جميع refresh tokens للمستخدم (مفيدة عند تغيير كلمة المرور)
  async revokeAllRefreshTokens(userId: number) {
    await this.userService.update(userId, { refreshToken: null });
  }
}
