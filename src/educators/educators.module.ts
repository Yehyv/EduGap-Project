import { Module } from '@nestjs/common';
import { EducatorsService } from './educators.service';
import { EducatorsController } from './educators.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Educator } from './entities/educator.entity';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { Content } from 'src/contents/entities/content.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Educator, User, Content]),
    AuthModule,
    UsersModule,
  ],
  controllers: [EducatorsController],
  providers: [EducatorsService],
})
export class EducatorsModule {}
