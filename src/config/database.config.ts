import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: config.get<string>('DB_HOST'),
  port: parseInt(config.get<string>('DB_PORT') ?? '3306', 10),
  username: config.get<string>('DB_USERNAME'),
  password: config.get<string>('DB_PASSWORD'),
  database: config.get<string>('DB_NAME'),
  autoLoadEntities: true,
  synchronize: true,
  dropSchema: false,
  logging: ['error'],
  charset: 'utf8mb4_general_ci',
});
