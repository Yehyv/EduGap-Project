import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import {
  asyncLocalStorage,
  RequestContextStore,
} from '../context/request-context.service';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;
    email?: string;
    instituteId?: number;
  };
}

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const store: RequestContextStore = {
      userId: request.user?.sub,
      method: request.method,
      route: request.route?.path,
      originalUrl: request.originalUrl,
      ip: request.ip,
      userAgent: request.get('user-agent') ?? undefined,
      params: request.params,
      query: request.query as Record<string, unknown>,
      body: this.sanitizeBody(request.body),
    };

    asyncLocalStorage.enterWith(store);

    return next.handle();
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const hiddenFields = new Set([
      'password',
      'confirmPassword',
      'oldPassword',
      'newPassword',
      'refreshToken',
      'accessToken',
      'token',
      'otp',
    ]);

    const plain = { ...(body as Record<string, unknown>) };

    for (const key of Object.keys(plain)) {
      if (hiddenFields.has(key)) {
        plain[key] = '[REDACTED]';
      }
    }

    return plain;
  }
}