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
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UserOtp } from 'src/users/entities/user-otp.entity';

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
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      user,
    });
    await this.otpRepository.save(otp);

    // هنا تبعت SMS او Email
    console.log(`📩 OTP for user ${user.email}: ${code}`);

    return otp;
  }

  // -------- Verify OTP ----------
  async verifyOtp(userId: number, code: string) {
    const otp = await this.otpRepository.findOne({
      where: { user: { id: userId }, code, isUsed: false },
      relations: ['user'],
    });

    if (!otp) throw new BadRequestException('Invalid OTP');

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    otp.isUsed = true;
    await this.otpRepository.save(otp);

    // بعد ما تـ mark otp.isUsed = true ...
    const tempPayload = {
      sub: otp.user.id,
      email: otp.user.email,
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
  async resendOtp(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    // invalidate old OTPs
    await this.otpRepository.update({ user: { id: userId } }, { isUsed: true });

    return this.generateOtp(user);
  }

  // -------- Login Flow ----------
  async signin(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    if (!user) throw new ForbiddenException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new ForbiddenException('Invalid credentials');

    const isFirst = await this.userService.isFirstLogin(user);
    if (isFirst) {
      await this.generateOtp(user);
      return { mustVerifyOtp: true, message: 'OTP sent to your phone' };
    }

    // هنا يطلع توكن عادي لو مش first login
    const payload = {
      sub: user.id,
      email: user.email,
      instituteId: user.institute?.id || 0,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_TOKEN,
      expiresIn: '15m',
    });
    return { accessToken: token };
  }

  async Logout(userId: number) {
    await this.userService.update(userId, { refreshToken: null });
  }

  async refreshTokens(
    userId: number,
    rt: string,
    languageId?: number,
  ): Promise<Tokens> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['institute', 'institute.translations'],
    });

    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    const isMatch = await bcrypt.compare(rt, user.refreshToken);
    if (!isMatch) throw new ForbiddenException('Access Denied');

    const instituteName =
      user.institute?.translations.find((t) => t.language.id === languageId)
        ?.name ||
      user.institute?.translations[0]?.name ||
      '';

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.institute?.id,
      user.full_name,
      instituteName,
    );

    await this.userService.update(user.id, {
      refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
    });
    return tokens;
  }

  async getTokens(
    userId: number,
    email: string,
    instituteId: number,
    full_name: string,
    instituteName: string,
  ): Promise<Tokens> {
    const payload = {
      sub: userId,
      email,
      instituteId,
      full_name,
      instituteName,
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
