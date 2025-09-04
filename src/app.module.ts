import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { getDatabaseConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsModule } from './students/students.module';
import { AuthModule } from './auth/auth.module';
import { LanguagesModule } from './languages/languages.module';
import { CoursesModule } from './courses/courses.module';
import { ProgramsModule } from './programs/programs.module';
import { ContentsModule } from './contents/contents.module';
import { TopicsModule } from './topics/topics.module';
import { InstitutesModule } from './institutes/institutes.module';
import { LessonsModule } from './lessons/lessons.module';
import { EducatorsModule } from './educators/educators.module';
import { ProgressModule } from './progress/progress.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { SavedCoursesModule } from './saved-courses/saved-courses.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    DatabaseModule,
    UsersModule,
    StudentsModule,
    AuthModule,
    LanguagesModule,
    CoursesModule,
    ProgramsModule,
    ContentsModule,
    TopicsModule,
    InstitutesModule,
    LessonsModule,
    EducatorsModule,
    ProgressModule,
    EnrollmentsModule,
    SavedCoursesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
