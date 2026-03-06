import { Module } from '@nestjs/common';
import { PackageEnrollmentsService } from './package-enrollments.service';
import { PackageEnrollmentsController } from './package-enrollments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { PackageEnrollment } from './entities/package-enrollment.entity';
import { PackageContent } from 'src/packages/entities/package-content.entity';
import { Content } from 'src/contents/entities/content.entity';
import { User } from 'src/users/entities/user.entity';
import { Package } from 'src/packages/entities/package.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PackageEnrollment,
      Enrollment,
      PackageContent,
      Content,
      User,
      PackageContent,
      Package,
    ]),
  ],
  controllers: [PackageEnrollmentsController],
  providers: [PackageEnrollmentsService],
})
export class PackageEnrollmentsModule {}
