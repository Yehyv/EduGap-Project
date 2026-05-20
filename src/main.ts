import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as express from 'express';
import { join } from 'path';
import { ContextInterceptor } from './common/interceptors/context.interceptor';
import { TransactionsService } from './transactions/transactions.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const transactionsService = app.get(TransactionsService);
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(
    new ContextInterceptor(),
    new LoggingInterceptor(transactionsService),
    new ResponseInterceptor(),
  );
  app.useGlobalInterceptors(new ContextInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: [
      'http://72.60.39.170',
      'http://127.0.0.1:5173',
      'http://localhost:5173',
    ],
  });
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true }, // "1" -> 1
    }),
  );
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
}
void bootstrap();
