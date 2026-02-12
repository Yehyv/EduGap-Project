import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { asyncLocalStorage } from '../context/request-context.service';
import { Request } from 'express';
interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;
    email?: string;
    instituteId?: number;
  };
}
@Injectable()
export class ContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.sub;

    return asyncLocalStorage.run({ userId }, () => next.handle());
  }
}
