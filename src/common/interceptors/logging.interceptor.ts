import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Response } from 'express';
import { TransactionsService } from 'src/transactions/transactions.service';
import { TransactionType } from 'src/transactions/entities/transaction.entity';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly transactionsService: TransactionsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const response = http.getResponse<Response>();

    let actionType:
      | TransactionType.REQUEST_SUCCESS
      | TransactionType.REQUEST_ERROR = TransactionType.REQUEST_SUCCESS;

    let errorMessage: string | null = null;

    return next.handle().pipe(
      tap({
        error: (error: unknown) => {
          actionType = TransactionType.REQUEST_ERROR;

          if (error instanceof HttpException) {
            const res = error.getResponse();
            errorMessage =
              typeof res === 'string'
                ? res
                : JSON.stringify(res ?? { message: error.message });
          } else if (error instanceof Error) {
            errorMessage = error.message;
          } else {
            errorMessage = 'Unknown error';
          }
        },
      }),
      finalize(() => {
        void this.transactionsService.logHttpRequest({
          type: actionType,
          statusCode: response?.statusCode ?? 500,
          errorMessage,
        });
      }),
    );
  }
}
