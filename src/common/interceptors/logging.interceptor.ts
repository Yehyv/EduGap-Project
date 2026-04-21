import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Request } from 'express';
import { TransactionsService } from 'src/transactions/transactions.service';
import { TransactionType } from 'src/transactions/entities/transaction.entity';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly transactionsService: TransactionsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();

    const method = request.method.toUpperCase();
    const url = request.originalUrl ?? '';

    const shouldSkip =
      !['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ||
      method === 'OPTIONS' ||
      url.startsWith('/uploads') ||
      url.startsWith('/docs') ||
      url.startsWith('/swagger');

    if (shouldSkip) {
      return next.handle();
    }

    let shouldLogError = false;
    let errorMessage: string | null = null;
    let statusCode = 500;

    return next.handle().pipe(
      tap({
        error: (error: unknown) => {
          shouldLogError = true;

          if (error instanceof HttpException) {
            statusCode = error.getStatus();

            const res = error.getResponse();
            errorMessage =
              typeof res === 'string'
                ? res
                : JSON.stringify(res ?? { message: error.message });
          } else if (error instanceof Error) {
            statusCode = 500;
            errorMessage = error.message;
          } else {
            statusCode = 500;
            errorMessage = 'Unknown error';
          }
        },
      }),
      finalize(() => {
        if (!shouldLogError) {
          return;
        }

        void this.transactionsService.logHttpRequest({
          type: TransactionType.REQUEST_ERROR,
          statusCode,
          errorMessage,
        });
      }),
    );
  }
}