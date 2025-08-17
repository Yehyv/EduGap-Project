import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/jwt-payload.interface';
import { Request as ExpressRequest } from 'express';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() as (
        req: ExpressRequest,
      ) => string | null,
      secretOrKey: process.env.JWT_REFRESH_SECRET as string,
      passReqToCallback: true,
    });
  }
  validate(
    req: Request & { headers: { authorization?: string } },
    payload: JwtPayload,
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    return { ...payload, refreshToken: token };
  }
}
