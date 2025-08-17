import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Response, Request } from 'express';

interface StandardResponse {
  status: number;
  message: string | string[];
  data: unknown;
}

interface DataWithMessage {
  message?: string | string[];
  [key: string]: unknown;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<Request>();

    console.log('=== Interceptor Called ===');
    console.log('Route:', request.url);

    return next.handle().pipe(
      map((data: unknown): StandardResponse => {
        console.log('=== Success Response in Interceptor ===');
        console.log('Data received:', data);

        let message: string | string[] = 'Request successful';
        let resultData: unknown = data;

        if (this.isObjectWithMessage(data)) {
          message = data.message ?? message;
          const { message: _, ...rest } = data;
          resultData = Object.keys(rest).length > 0 ? rest : null;
        }

        return {
          status: response.statusCode,
          message,
          data: resultData,
        };
      }),
      catchError((err: unknown) => {
        console.log('=== Error in Interceptor ===');
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let messages: string[] = [];

        if (err instanceof HttpException) {
          status = err.getStatus();
          const res = err.getResponse();
          if (typeof res === 'string') {
            messages.push(res);
          } else if (typeof res === 'object' && res !== null) {
            if ('message' in res) {
              messages = Array.isArray(res['message'])
                ? res['message'].map(String)
                : [String(res['message'])];
            } else {
              messages.push(JSON.stringify(res));
            }
          }
        } else if (err instanceof Error) {
          messages.push(err.message);
        } else {
          messages.push(String(err));
        }

        console.log('Error status:', status);
        console.log('Error messages:', messages);

        return throwError(
          () =>
            new HttpException(
              { status, message: messages, data: null },
              status,
            ),
        );
      }),
    );
  }

  private isObjectWithMessage(data: unknown): data is DataWithMessage {
    return data !== null && typeof data === 'object' && 'message' in data;
  }
}
