import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // شغّل Passport عادي سواء فيه توكن أو لأ
    return super.canActivate(context);
  }

  // ✅ نفس التوقيع الأصلي بالظبط
  handleRequest<TUser = any>(
    err: any,
    user: TUser,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    // متترميش Unauthorized حتى لو مفيش توكن
    // هرجع user كما هو (ممكن يكون undefined)
    return user;
  }
}
