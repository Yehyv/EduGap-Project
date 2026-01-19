import { Module } from '@nestjs/common';
import { SystemAuthService } from './system-auth.service';
import { SystemAuthController } from './system-auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { SystemUsersModule } from 'src/system-users/system-users.module';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { RefreshStrategy } from 'src/auth/strategies/refresh.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([SystemUser]),
    SystemUsersModule,
  ],
  controllers: [SystemAuthController],
  providers: [SystemAuthService, JwtStrategy, RefreshStrategy],
  exports: [SystemAuthService],
})
export class SystemAuthModule {}
