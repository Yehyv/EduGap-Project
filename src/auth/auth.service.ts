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
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    const isMatch = await bcrypt.compare(rt, user.refreshToken);
    if (!isMatch) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email, user.instituteId);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
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
    const hashedPassword = await bcrypt.hash(refreshToken, 10);
    await this.userService.update(userId, { refreshToken: hashedPassword });
  }
}
