import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Between, In, Repository, FindOptionsWhere } from 'typeorm';
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
import { User } from 'src/users/entities/user.entity';
import { CertificatePackage } from './entities/certificate-package.entity';
import { PackageEnrollment } from 'src/package-enrollments/entities/package-enrollment.entity';
import { Package } from 'src/packages/entities/package.entity';
import { PackageContent } from 'src/packages/entities/package-content.entity';
interface GenerateCertificateResult {
  serialNumber: string;
  certificateId: number;
  contentId?: number;
  language: CertificateLanguage;
  title: string;
  userCertificateName: string;
  hours: number;
  createdAt: Date;
  issueDate: Date;
  instituteLogo?: string;
}
interface GeneratePackageCertificateResult {
  serialNumber: string;
  certificateId: number;
  packageId?: number;
  language: CertificateLanguage;
  title: string;
  userCertificateName: string;
  hours: number;
  createdAt: Date;
  issueDate: Date;
  instituteLogo?: string;
  packageContent?: string; // JSON string of package contents
}
interface UserCertificateInfo {
  title: string;
  issueDate: Date;
}
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
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(CertificatePackage)
    private certificatePackageRepo: Repository<CertificatePackage>,
    @InjectRepository(PackageEnrollment)
    private packageEnrollmentRepo: Repository<PackageEnrollment>,
    @InjectRepository(Package)
    private pkgRepo: Repository<Package>,
    @InjectRepository(PackageContent)
    private packageContentRepo: Repository<PackageContent>,
  ) {}
  private async generateCertificateSerialNumber(
    language: CertificateLanguage,
    instituteId: number | null,
    sequenceOffset = 0,
  ): Promise<string> {
    const langPart = language === CertificateLanguage.AR ? 'AR' : 'EN';
    const institutePart = instituteId ?? 0;

    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const todayCertificatesCount = await this.certificateRepo.count({
      where: {
        issueDate: Between(startOfDay, endOfDay),
      },
    });

    const sequencePart = String(
      todayCertificatesCount + 1 + sequenceOffset,
    ).padStart(4, '0');

    return `EG-${langPart}-${institutePart}-${datePart}-${sequencePart}`;
  }
  async generateContentCertificates(contentId: number, userId: number) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { content: { id: contentId }, user: { id: userId } },
      select: ['id', 'status'],
    });

    if (!enrollment) {
      throw new NotFoundException('User not enrolled in content');
    }

    if (enrollment.status !== 1) {
      throw new BadRequestException('Content not completed yet');
    }

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['institute'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const content = await this.contentRepo.findOne({
      where: { id: contentId },
      relations: ['translations', 'translations.language'],
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    const durRow = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.topics', 't')
      .leftJoin('t.lessons', 'l')
      .select('COALESCE(SUM(l.duration), 0)', 'totalDurationInSeconds')
      .where('c.id = :cid', { cid: contentId })
      .getRawOne<{ totalDurationInSeconds: string }>();

    const totalDurationInSeconds = Number(durRow?.totalDurationInSeconds ?? 0);
    const totalHours = Number((totalDurationInSeconds / 3600).toFixed(2));

    const arTranslation = content.translations.find(
      (t) => t.language?.name?.trim().toUpperCase() === 'EN',
    );

    const enTranslation = content.translations.find(
      (t) => t.language?.name?.trim().toUpperCase() === 'AR',
    );

    const arSerialNumber = await this.generateCertificateSerialNumber(
      CertificateLanguage.AR,
      user.institute?.id ?? null,
      0,
    );

    const enSerialNumber = await this.generateCertificateSerialNumber(
      CertificateLanguage.EN,
      user.institute?.id ?? null,
      1,
    );

    const certificates = [
      this.certificateRepo.create({
        serialNumber: arSerialNumber,
        type: CertificateType.CONTENT,
        language: CertificateLanguage.AR,
        user: { id: userId },
        title: arTranslation?.name || content.translations[0]?.name,
        userCertificateName: user.full_name,
        issueDate: new Date(),
        hours: totalHours,
      }),

      this.certificateRepo.create({
        serialNumber: enSerialNumber,
        type: CertificateType.CONTENT,
        language: CertificateLanguage.EN,
        user: { id: userId },
        title:
          enTranslation?.name ||
          content.translations[1]?.name ||
          content.translations[0]?.name,
        userCertificateName: user.full_name,
        issueDate: new Date(),
        hours: totalHours,
      }),
    ];

    await this.certificateRepo.save(certificates);

    const certificateContents = certificates.map((cert) =>
      this.certificateContentRepo.create({
        certificate: cert,
        content,
      }),
    );

    await this.certificateContentRepo.save(certificateContents);

    return certificates.map((c) => ({
      serialNumber: c.serialNumber,
      language: c.language,
      title: c.title,
      userCertificateName: c.userCertificateName,
      hours: c.hours,
    }));
  }
  async generatePackageCertificates(packageId: number, userId: number) {
    const packageEnrollment = await this.packageEnrollmentRepo.findOne({
      where: {
        package: { id: packageId },
        user: { id: userId },
      },
    });

    if (!packageEnrollment) {
      throw new NotFoundException('User not enrolled in package');
    }

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['institute'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const pkg = await this.pkgRepo.findOne({
      where: { id: packageId },
      relations: ['translations', 'translations.language'],
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    const packageContents = await this.packageContentRepo.find({
      where: {
        package: { id: packageId },
        is_active: 1,
      },
      relations: [
        'content',
        'content.translations',
        'content.translations.language',
      ],
      order: {
        order_no: 'ASC',
      },
    });

    if (!packageContents.length) {
      throw new BadRequestException('Package has no contents');
    }

    const contentIds = packageContents.map((pc) => pc.content.id);

    const contentEnrollments = await this.enrollmentRepo.find({
      where: {
        user: { id: userId },
        content: { id: In(contentIds) },
      },
      relations: ['content'],
    });

    const allCompleted = packageContents.every((pc) =>
      contentEnrollments.some(
        (e) => e.content.id === pc.content.id && e.status === 1,
      ),
    );

    if (!allCompleted) {
      throw new BadRequestException(
        'Package is not completed yet. Complete all contents first',
      );
    }

    const durRow = await this.packageContentRepo
      .createQueryBuilder('pc')
      .leftJoin('pc.content', 'c')
      .leftJoin('c.topics', 't')
      .leftJoin('t.lessons', 'l')
      .select('COALESCE(SUM(l.duration), 0)', 'totalDurationInSeconds')
      .where('pc.package_id = :packageId', { packageId })
      .andWhere('pc.is_active = :isActive', { isActive: 1 })
      .getRawOne<{ totalDurationInSeconds: string }>();

    const totalDurationInSeconds = Number(durRow?.totalDurationInSeconds ?? 0);
    const totalHours = Number((totalDurationInSeconds / 3600).toFixed(2));

    const getLangName = (name?: string) => name?.trim().toUpperCase();

    const arPackageTitle =
      pkg.translations.find((t) => getLangName(t.language?.name) === 'EN')
        ?.title || 'اسم الباقة';

    const enPackageTitle =
      pkg.translations.find((t) => getLangName(t.language?.name) === 'AR')
        ?.title || 'Package Name';

    const arPackageContentsList = packageContents.map((pc) => ({
      contentId: pc.content.id,
      name:
        pc.content.translations.find(
          (t) => getLangName(t.language?.name) === 'EN',
        )?.name || 'اسم المحتوى',
    }));

    const enPackageContentsList = packageContents.map((pc) => ({
      contentId: pc.content.id,
      name:
        pc.content.translations.find(
          (t) => getLangName(t.language?.name) === 'AR',
        )?.name || 'Content Name',
    }));

    const issueDate = new Date();

    const arSerialNumber = await this.generateCertificateSerialNumber(
      CertificateLanguage.AR,
      user.institute?.id ?? null,
      0,
    );

    const enSerialNumber = await this.generateCertificateSerialNumber(
      CertificateLanguage.EN,
      user.institute?.id ?? null,
      1,
    );

    const arCertificate = this.certificateRepo.create({
      serialNumber: arSerialNumber,
      type: CertificateType.PACKAGE,
      language: CertificateLanguage.AR,
      user: { id: userId },
      title: arPackageTitle,
      userCertificateName: user.full_name,
      issueDate,
      hours: totalHours,
    });

    const enCertificate = this.certificateRepo.create({
      serialNumber: enSerialNumber,
      type: CertificateType.PACKAGE,
      language: CertificateLanguage.EN,
      user: { id: userId },
      title: enPackageTitle,
      userCertificateName: user.full_name,
      issueDate,
      hours: totalHours,
    });

    await this.certificateRepo.save([arCertificate, enCertificate]);

    await this.certificatePackageRepo.save([
      this.certificatePackageRepo.create({
        certificate: arCertificate,
        package: pkg,
        packageContent: JSON.stringify(arPackageContentsList),
      }),
      this.certificatePackageRepo.create({
        certificate: enCertificate,
        package: pkg,
        packageContent: JSON.stringify(enPackageContentsList),
      }),
    ]);

    return [
      {
        serialNumber: arCertificate.serialNumber,
        language: arCertificate.language,
        title: arCertificate.title,
        userCertificateName: arCertificate.userCertificateName,
        hours: arCertificate.hours,
        packageContents: arPackageContentsList,
      },
      {
        serialNumber: enCertificate.serialNumber,
        language: enCertificate.language,
        title: enCertificate.title,
        userCertificateName: enCertificate.userCertificateName,
        hours: enCertificate.hours,
        packageContents: enPackageContentsList,
      },
    ];
  }
  async getUserContentCertificates(
    userId: number,
    language?: CertificateLanguage,
  ) {
    const qb = this.certificateContentRepo
      .createQueryBuilder('cc')
      .innerJoin('certificate', 'c', 'c.id = cc.certificateId')
      .innerJoin('content', 'ct', 'ct.id = cc.contentId')
      .innerJoin('c.user', 'u', 'u.id = c.userId')
      .innerJoin('u.institute', 'i', 'i.id = u.institute_id')
      .select([
        'c.id as certificateId',
        'ct.id as contentId',
        'c.serialNumber as serialNumber',
        'c.language as language',
        'c.title as title',
        'c.userCertificateName as userCertificateName',
        'c.hours as hours',
        'c.createdAt as createdAt',
        'c.issueDate as issueDate',
        'i.logo as instituteLogo',
      ])
      .where('c.userId = :userId', { userId })
      .andWhere('c.type = :type', { type: CertificateType.CONTENT });

    if (language) {
      qb.andWhere('c.language = :language', { language });
    }

    qb.orderBy('c.createdAt', 'DESC');
    console.log(
      'Executing query to fetch user content certificates with params:',
      {
        userId,
        language,
      },
    );
    const rows = await qb.getRawMany<GenerateCertificateResult>();
    console.log('Fetched certificates:', rows);
    return rows.map((item) => ({
      certificateId: item.certificateId,
      contentId: item.contentId,
      serialNumber: item.serialNumber,
      language: item.language,
      title: item.title,
      userCertificateName: item.userCertificateName,
      hours: item.hours,
      createdAt: item.createdAt,
      issueDate: item.issueDate,
      instituteLogo: item.instituteLogo,
    }));
  }
  async getUserPackageCertificates(
    userId: number,
    language?: CertificateLanguage,
  ) {
    const qb = this.certificatePackageRepo
      .createQueryBuilder('cp')
      .innerJoin('certificate', 'c', 'c.id = cp.certificateId')
      .innerJoin('packages', 'p', 'p.id = cp.packageId')
      .innerJoin('user', 'u', 'u.id = c.userId')
      .leftJoin('institute', 'i', 'i.id = u.institute_id')
      .select([
        'c.id as certificateId',
        'p.id as packageId',
        'c.serialNumber as serialNumber',
        'c.language as language',
        'c.title as title',
        'c.userCertificateName as userCertificateName',
        'c.hours as hours',
        'c.createdAt as createdAt',
        'c.issueDate as issueDate',
        'i.logo as instituteLogo',
        'cp.packageContent as packageContent',
      ])
      .where('c.userId = :userId', { userId })
      .andWhere('c.type = :type', { type: CertificateType.PACKAGE });

    if (language) {
      qb.andWhere('c.language = :language', { language });
    }

    qb.orderBy('c.createdAt', 'DESC');

    const rows = await qb.getRawMany<GeneratePackageCertificateResult>();

    return rows.map((item) => ({
      certificateId: item.certificateId,
      packageId: item.packageId,
      serialNumber: item.serialNumber,
      language: item.language,
      title: item.title,
      userCertificateName: item.userCertificateName,
      hours: Number(item.hours),
      createdAt: item.createdAt,
      issueDate: item.issueDate,
      instituteLogo: item.instituteLogo,
      packageContent: item.packageContent
        ? JSON.parse(item.packageContent)
        : [],
    }));
  }
  async getUserCertificatesSummary(
    userId: number,
    language?: CertificateLanguage,
  ) {
    const whereCondition: FindOptionsWhere<Certificate> = {
      user: { id: userId },
    };

    if (language) {
      whereCondition.language = language;
    }

    const certificates = await this.certificateRepo.find({
      where: whereCondition,
      select: ['title', 'issueDate'],
      order: {
        createdAt: 'DESC',
      },
    });

    return certificates.map((certificate) => ({
      title: certificate.title,
      issueDate: certificate.issueDate,
    }));
  }
}
