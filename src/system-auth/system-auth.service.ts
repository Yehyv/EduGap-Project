import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { Repository } from 'typeorm';
import { SystemUsersService } from 'src/system-users/system-users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SystemAuthService {
  constructor(
    @InjectRepository(SystemUser)
    private readonly systemUserRepository: Repository<SystemUser>,
    private systemUserService: SystemUsersService,
    private jwtService: JwtService,
  ) {}
  async systemSignin(username: string, password: string) {
    const user =
      await this.systemUserService.findSystemUserByUsername(username);
    if (!user) throw new ForbiddenException('Invalid credentials');
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new ForbiddenException('Invalid credentials');
    const payload = {
      sub: user.id,
      instituteId: user.institute?.id || 0,
      role: user.SysUserrole?.role_title,
    };
    const tokens = await this.getTokens(
      payload.sub,
      payload.instituteId,
      payload.role,
    );
    await this.systemUserRepository.update(user.id, {
      refresh_token: await bcrypt.hash(tokens.refresh_token, 10),
    });
    return {
      message: 'System user signed in successfully',
      ...tokens,
    };
  }
  async logout(userId: number) {
    await this.systemUserService.update(userId, { refreshToken: null });
  }
  async refreshTokens(userId: number, rt: string) {
    const user = await this.systemUserRepository.findOne({
      where: { id: userId },
      relations: ['SysUserrole', 'institute', 'institute.translations'],
    });
    if (!user || !user.refresh_token)
      throw new ForbiddenException('Access Denied');
    const isMatch = await bcrypt.compare(rt, user.refresh_token);
    if (!isMatch) throw new ForbiddenException('Access Denied');
    const tokens = await this.getTokens(
      user.id,
      user.institute?.id || 0,
      user.SysUserrole?.role_title || '',
    );
    await this.systemUserService.update(user.id, {
      refreshToken: await bcrypt.hash(tokens.refresh_token, 10),
    });
    return tokens;
  }
  async getTokens(userId: number, instituteId: number, role: string) {
    const payload = {
      sub: userId,
      instituteId,
      role,
    };
    const [accessToken, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_TOKEN,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refresh_token };
  }
  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.systemUserService.update(userId, { refreshToken: hashedToken });
  }
  async revokeAllRefreshTokens(userId: number) {
    await this.systemUserService.update(userId, { refreshToken: null });
  }
}
