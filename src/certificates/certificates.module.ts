import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateContent } from './entities/certificate-content.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { Content } from 'src/contents/entities/content.entity';
import { Certificate } from './entities/certificate.entity';
import { User } from 'src/users/entities/user.entity';
import { CertificatePackage } from './entities/certificate-package.entity';
import { PackageEnrollment } from 'src/package-enrollments/entities/package-enrollment.entity';
import { Package } from 'src/packages/entities/package.entity';
import { PackageContent } from 'src/packages/entities/package-content.entity';
import { TransactionsModule } from 'src/transactions/transactions.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Certificate,
      CertificateContent,
      Enrollment,
      Content,
      User,
      CertificatePackage,
      PackageEnrollment,
      Package,
      PackageContent,
    ]),
    TransactionsModule,
  ], // Add your entities here
  controllers: [CertificatesController],
  providers: [CertificatesService],
})
export class CertificatesModule {}
