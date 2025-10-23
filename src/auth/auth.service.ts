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
import { UserOtp } from 'src/users/entities/user-otp.entity';
import { randomUUID } from 'crypto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserOtp)
    private readonly otpRepository: Repository<UserOtp>,
    private userService: UsersService,
    private jwtService: JwtService,
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

  // -------- Generate OTP ----------
  async generateOtp(user: User): Promise<UserOtp> {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const otp = this.otpRepository.create({
      challengeId: randomUUID(),
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      user,
    });
    await this.otpRepository.save(otp);

    // هنا تبعت SMS او Email
    console.log(`📩 OTP for user ${user.email}: ${code}`);

    return otp;
  }

  // -------- Verify OTP ----------
  async verifyOtp(challengeId: string, code: string) {
    const otp = await this.otpRepository.findOne({
      where: { challengeId, isUsed: false },
      relations: ['user'],
    });

    if (!otp) throw new BadRequestException('Invalid OTP');

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }
    if (otp.code !== code) throw new BadRequestException('Invalid OTP');

    otp.isUsed = true;
    await this.otpRepository.save(otp);

    // بعد ما تـ mark otp.isUsed = true ...
    const tempPayload = {
      sub: otp.user.id,
      username: otp.user.username,
      mustChangePassword: true,
    };
    const accessToken = await this.jwtService.signAsync(tempPayload, {
      secret: process.env.JWT_ACCESS_TOKEN,
      expiresIn: '10m', // مؤقت
    });
    return {
      message: 'OTP verified successfully, please change your password',
      mustChangePassword: true,
      accessToken, // ندي للفرونت يستخدمه في /auth/change-password
    };
  }

  // -------- Resend OTP ----------
  async resendOtp(challengeId: string) {
    const prev = await this.otpRepository.findOne({
      where: { challengeId, isUsed: false },
      relations: ['user'],
    });
    if (!prev) throw new BadRequestException('Invalid challenge');

    // إبطال القديم
    await this.otpRepository.update({ id: prev.id }, { isUsed: true });

    // توليد جديد لنفس المستخدم
    const next = await this.generateOtp(prev.user);

    return {
      message: 'OTP re-sent',
      data: {
        challengeId: next.challengeId,
        ...(process.env.OTP_STATS === 'true' ? { otp: next.code } : {}),
        // code: next.code,
      },
    };
  }

  // -------- Login Flow ----------
  async signin(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    if (!user) throw new ForbiddenException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new ForbiddenException('Invalid credentials');

    const isFirst = await this.userService.isFirstLogin(user);
    if (isFirst) {
      const otp = await this.generateOtp(user);
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
    };
    const tokens = await this.getTokens(payload.sub, payload.instituteId);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async Logout(userId: number) {
    await this.userService.update(userId, { refreshToken: null });
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['institute', 'institute.translations'],
    });

    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    const isMatch = await bcrypt.compare(rt, user.refreshToken);
    if (!isMatch) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.institute?.id);

    await this.userService.update(user.id, {
      refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
    });
    return tokens;
  }

  async getTokens(userId: number, instituteId: number): Promise<Tokens> {
    const payload = {
      sub: userId,
      instituteId,
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
}
