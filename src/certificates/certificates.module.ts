import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateContent } from './entities/certificate-content.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { Content } from 'src/contents/entities/content.entity';
import { Certificate } from './entities/certificate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Certificate,
      CertificateContent,
      Enrollment,
      Content,
    ]),
  ], // Add your entities here
  controllers: [CertificatesController],
  providers: [CertificatesService],
})
export class CertificatesModule {}
