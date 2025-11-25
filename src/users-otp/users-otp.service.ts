import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUsersOtpDto } from './dto/create-users-otp.dto';
import { UpdateUsersOtpDto } from './dto/update-users-otp.dto';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpPurpose, UserOtp } from './entities/users-otp.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class UsersOtpService {
  constructor(
    @InjectRepository(UserOtp)
    private readonly otpRepository: Repository<UserOtp>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  private async createOtp(
    user: User,
    purpose: OtpPurpose,
    smsPhone?: string, // رقم نبعتله الـ OTP بس، مش بيتخزن
  ): Promise<UserOtp> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const otp = this.otpRepository.create({
      challengeId: randomUUID(),
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      user,
      purpose,
    });

    await this.otpRepository.save(otp);

    const destPhone = smsPhone ?? user.phone;
    console.log(
      `📩 [${purpose}] OTP for user ${user.email} (phone: ${destPhone}): ${code}`,
    );
    // هنا بعدين هتحط كول الـ SMS service وتستخدم destPhone

    return otp;
  }

  // ---------- USE CASES: generateOtpXXX ----------

  // أول لوجين
  async generateOtpForFirstLogin(user: User): Promise<UserOtp> {
    return this.createOtp(user, 'FIRST_LOGIN');
  }

  // ريست باسورد
  async generateOtpForResetPassword(user: User): Promise<UserOtp> {
    return this.createOtp(user, 'RESET_PASSWORD');
  }

  // تغيير رقم الموبايل – نبعت على newPhone لكن مش بنخزنه
  async generateOtpForChangePhone(
    user: User,
    newPhone: string,
  ): Promise<UserOtp> {
    return this.createOtp(user, 'CHANGE_PHONE', newPhone);
  }

  // لو عايز use-case general زي اللي كان عندك قبل كده:
  async generateOtp(user: User): Promise<UserOtp> {
    // مثلاً نعتبره RESET_PASSWORD كـ default
    return this.createOtp(user, 'RESET_PASSWORD');
  }

  // ---------- BASE: validateOtp ----------
  private async validateOtp(
    challengeId: string,
    code: string,
  ): Promise<UserOtp> {
    const otp = await this.otpRepository.findOne({
      where: { challengeId, isUsed: false },
      relations: ['user'],
    });

    if (!otp) throw new BadRequestException('Invalid OTP');

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    if (otp.code !== code) {
      throw new BadRequestException('Invalid OTP');
    }

    otp.isUsed = true;
    await this.otpRepository.save(otp);

    return otp;
  }

  // ---------- Verify OTP for change PASSWORD ----------
  async verifyOtpForChangePassword(challengeId: string, code: string) {
    const otp = await this.validateOtp(challengeId, code);

    if (otp.purpose !== 'RESET_PASSWORD' && otp.purpose !== 'FIRST_LOGIN') {
      throw new BadRequestException('OTP purpose mismatch');
    }

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
      accessToken,
    };
  }

  // ---------- Verify OTP for change PHONE ----------
  async verifyOtpForChangePhone(
    challengeId: string,
    code: string,
  ): Promise<{ userId: number }> {
    const otp = await this.validateOtp(challengeId, code);

    if (otp.purpose !== 'CHANGE_PHONE') {
      throw new BadRequestException('OTP purpose mismatch');
    }

    return {
      userId: otp.user.id,
    };
  }

  // ---------- Resend OTP ----------
  async resendOtp(challengeId: string) {
    const prev = await this.otpRepository.findOne({
      where: { challengeId, isUsed: false },
      relations: ['user'],
    });
    if (!prev) throw new BadRequestException('Invalid challenge');

    // إبطال القديم
    await this.otpRepository.update({ id: prev.id }, { isUsed: true });

    // توليد جديد لنفس المستخدم ونفس الـ purpose
    const next = await this.createOtp(
      prev.user,
      (prev.purpose as OtpPurpose) ?? 'RESET_PASSWORD',
    );

    return {
      message: 'OTP re-sent',
      data: {
        challengeId: next.challengeId,
        ...(process.env.OTP_STATS === 'true' ? { code: next.code } : {}),
      },
    };
  }
}
