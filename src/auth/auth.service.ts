import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from './types/tokens.interface';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UsersOtpService } from 'src/users-otp/users-otp.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private userService: UsersService,
    private jwtService: JwtService,
    private otpService: UsersOtpService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: [
        'institute',
        'institute.translations',
        'institute.translations.language',
      ],
    });
  }

  // -------- Login Flow ----------
  async signin(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    if (!user) throw new ForbiddenException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new ForbiddenException('Invalid credentials');

    const isFirst = await this.userService.isFirstLogin(user);
    if (isFirst) {
      // ✅ استخدم use-case المخصوص لأول لوجين
      const otp = await this.otpService.generateOtpForFirstLogin(user);
      return {
        mustVerifyOtp: true,
        message: 'OTP sent to your phone',
        challengeId: otp.challengeId,
        ...(process.env.OTP_STATS === 'true' ? { code: otp.code } : {}),
      };
    }

    // هنا يطلع توكن عادي لو مش first login
    const payload = {
      sub: user.id,
      instituteId: user.institute?.id || 0,
      roleId: user.UserRole?.id,
    };
    const tokens = await this.getTokens(
      payload.sub,
      payload.instituteId,
      payload.roleId,
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async Logout(userId: number) {
    await this.userService.update(userId, { refreshToken: null });
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['institute', 'institute.translations', 'UserRole'],
    });

    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    const isMatch = await bcrypt.compare(rt, user.refreshToken);
    if (!isMatch) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(
      user.id,
      user.institute?.id,
      user.UserRole?.id,
    );

    await this.userService.update(user.id, {
      refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
    });
    return tokens;
  }

  async getTokens(
    userId: number,
    instituteId: number,
    roleId: number,
  ): Promise<Tokens> {
    const payload = {
      sub: userId,
      instituteId,
      roleId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_TOKEN,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.update(userId, { refreshToken: hashedToken });
  }

  async revokeAllRefreshTokens(userId: number) {
    await this.userService.update(userId, { refreshToken: null });
  }

  async forceChangePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    const result = await this.userService.changePassword(
      userId,
      oldPassword,
      newPassword,
      confirmPassword,
    );

    await this.revokeAllRefreshTokens(userId);
    return result;
  }

  async requestPasswordReset(nationalId: string, phone: string) {
    const user = await this.userRepository.findOne({
      where: {
        national_id: nationalId,
        phone,
      },
    });

    if (!user) {
      // تقدر تخلي الرسالة جينيريك عشان متفضحش لو اليوزر مش موجود
      throw new BadRequestException('Invalid national id or phone');
    }

    // ✅ استخدم use-case المخصوص للريست باسورد
    const otp = await this.otpService.generateOtpForResetPassword(user);

    return {
      message: 'OTP sent to your phone',
      challengeId: otp.challengeId,
      ...(process.env.OTP_STATS === 'true' ? { code: otp.code } : {}),
    };
  }

  async resetPasswordAfterOtp(
    userId: number,
    newPassword: string,
    confirmPassword: string,
  ) {
    // من غير oldPassword
    const result = await this.userService.resetPasswordWithOtp(
      userId,
      newPassword,
      confirmPassword,
    );

    // نمسح كل الـ refresh tokens القديمة
    await this.revokeAllRefreshTokens(userId);

    return result; // { message: 'Password reset successfully' }
  }
}
