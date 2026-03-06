import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import {
  Certificate,
  CertificateLanguage,
  CertificateType,
} from './entities/certificate.entity';
import { CertificateContent } from './entities/certificate-content.entity';
import { Content } from 'src/contents/entities/content.entity';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Certificate)
    private certificateRepo: Repository<Certificate>,
    @InjectRepository(CertificateContent)
    private certificateContentRepo: Repository<CertificateContent>,
    @InjectRepository(Content)
    private contentRepo: Repository<Content>,
  ) {}
  async generateContentCertificates(contentId: number, userId: number) {
    // 1️⃣ التأكد إن المستخدم أكمل المحتوى
    const enrollment = await this.enrollmentRepo.findOne({
      where: { content: { id: contentId }, user: { id: userId } },
      select: ['id', 'status'],
    });

    if (!enrollment)
      throw new NotFoundException('User not enrolled in content');
    if (enrollment.status !== 1)
      throw new BadRequestException('Content not completed yet');

    // 2️⃣ جلب الـ content + حساب totalDuration
    const content = await this.contentRepo.findOne({
      where: { id: contentId },
      relations: ['translations'],
    });
    if (!content) throw new NotFoundException('Content not found');

    const durRow = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.topics', 't')
      .leftJoin('t.lessons', 'l')
      .select('COALESCE(SUM(l.duration),0)', 'totalDuration')
      .where('c.id = :cid', { cid: contentId })
      .getRawOne<{ totalDuration: string }>();

    const totalDuration = Number(durRow?.totalDuration ?? 0);

    // 3️⃣ توليد شهادتين (AR + EN)
    const languages: CertificateLanguage[] = [
      CertificateLanguage.AR,
      CertificateLanguage.EN,
    ];
    const certificates: Certificate[] = [];

    for (const lang of languages) {
      const cert = this.certificateRepo.create({
        serialNumber: uuidv4(),
        type: CertificateType.CONTENT,
        language: lang,
        user: { id: userId },
        title: content.translations[0]?.name ?? 'Content Name',
        userCertificateName: 'Certificate of Completion',
        issueDate: new Date(),
        hours: totalDuration,
      });

      certificates.push(cert);
    }

    // 4️⃣ حفظ الشهادتين في Certificate
    await this.certificateRepo.save(certificates);

    // 5️⃣ ربط كل شهادة بالـ content
    const certificateContents = certificates.map((cert) =>
      this.certificateContentRepo.create({
        certificate: cert,
        content,
      }),
    );
    await this.certificateContentRepo.save(certificateContents);

    // 6️⃣ رجع البيانات المطلوبة فقط
    return certificates.map((c) => ({
      serialNumber: c.serialNumber,
      title: c.title,
      hours: c.hours,
    }));
  }
}
