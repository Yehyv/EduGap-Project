import { ForbiddenException, Injectable } from '@nestjs/common';
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
    const user = await this.userService.findByEmail(dto.email);
    if (!user || !(await bcrypt.hash(user.password, 10)))
      throw new ForbiddenException('Invalid credentials');
    const tokens = await this.getTokens(user.id, user.email);
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

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const payload = { sub: userId, email };

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
