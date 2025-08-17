import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse() as
        | string
        | { message?: string };
      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (
        errorResponse &&
        typeof errorResponse === 'object' &&
        'message' in errorResponse
      ) {
        message =
          (errorResponse as { message?: string }).message || exception.message;
      } else {
        message = exception.message;
      }
    }

    response.status(status).json({
      status,
      message,
      data: null,
    });
  }
}
