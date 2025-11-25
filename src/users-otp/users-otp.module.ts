import { Module } from '@nestjs/common';
import { UsersOtpService } from './users-otp.service';
import { UsersOtpController } from './users-otp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOtp } from './entities/users-otp.entity';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([UserOtp, User]),
  ],
  controllers: [UsersOtpController],
  providers: [UsersOtpService],
  exports: [UsersOtpService],
})
export class UsersOtpModule {}
