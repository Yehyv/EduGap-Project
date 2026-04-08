import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { getDatabaseConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { ContentCategoriesModule } from './content-categories/content-categories.module';
import { SystemUsersModule } from './system-users/system-users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SavedLessonModule } from './saved-lesson/saved-lesson.module';
import { LessonMaterialsModule } from './lesson-materials/lesson-materials.module';
import { LessonNotesModule } from './lesson-notes/lesson-notes.module';
import { LessonReactionsModule } from './lesson-reactions/lesson-reactions.module';
import { LessonCommentsModule } from './lesson-comments/lesson-comments.module';
import { ContentReviewsModule } from './content-reviews/content-reviews.module';
import { SpecializationsModule } from './specializations/specializations.module';
import { PackagesModule } from './packages/packages.module';
import { EducatorReviewsModule } from './educator-reviews/educator-reviews.module';
import { PrerequiestContentsModule } from './prerequiest-contents/prerequiest-contents.module';
import { SavedContentsModule } from './saved-contents/saved-contents.module';
import { SavedPackagesModule } from './saved-packages/saved-packages.module';
import { SearchModule } from './search/search.module';
import { QuestionsModule } from './questions/questions.module';
import { SavedCoursesModule } from './saved-courses/saved-course.module';
import { UsersOtpModule } from './users-otp/users-otp.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CountriesModule } from './countries/countries.module';
import { CitiesModule } from './cities/cities.module';
import { RegionsModule } from './regions/regions.module';
import { SystemRolesModule } from './system-roles/system-roles.module';
import { SystemAuthModule } from './system-auth/system-auth.module';
import { UsersBatchUploadModule } from './users-batch-upload/users-batch-upload.module';
import { AuditSubscriber } from './common/subscribers/audit.subscriber';
import { CourseCategoriesModule } from './course-categories/course-categories.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PackageEnrollmentsModule } from './package-enrollments/package-enrollments.module';
import { CertificatesModule } from './certificates/certificates.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    DatabaseModule,
    UsersModule,
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
    SavedContentsModule,
    ContentCategoriesModule,
    SystemUsersModule,
    TransactionsModule,
    SavedLessonModule,
    LessonMaterialsModule,
    LessonNotesModule,
    LessonReactionsModule,
    LessonCommentsModule,
    ContentReviewsModule,
    SpecializationsModule,
    PackagesModule,
    EducatorReviewsModule,
    PrerequiestContentsModule,
    SavedPackagesModule,
    SearchModule,
    QuestionsModule,
    SavedCoursesModule,
    UsersOtpModule,
    CountriesModule,
    CitiesModule,
    RegionsModule,
    SystemRolesModule,
    SystemAuthModule,
    UsersBatchUploadModule,
    CourseCategoriesModule,
    DashboardModule,
    PackageEnrollmentsModule,
    CertificatesModule,
    ContactMessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuditSubscriber],
})
export class AppModule {}
