import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePackageEnrollmentDto } from './dto/create-package-enrollment.dto';
import { UpdatePackageEnrollmentDto } from './dto/update-package-enrollment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PackageEnrollment } from './entities/package-enrollment.entity';
import { In, Repository } from 'typeorm';
import { Package } from 'src/packages/entities/package.entity';
import { Content } from 'src/contents/entities/content.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { User } from 'src/users/entities/user.entity';
import { PackageContent } from 'src/packages/entities/package-content.entity';
import { ContentTranslation } from 'src/contents/entities/content-translation.entity';
import { TransactionsService } from 'src/transactions/transactions.service';
import { TransactionType } from 'src/transactions/entities/transaction.entity';
@Injectable()
export class PackageEnrollmentsService {
  constructor(
    @InjectRepository(PackageEnrollment)
    private readonly packageEnrollmentRepo: Repository<PackageEnrollment>,
    @InjectRepository(Package)
    private readonly pkgRepo: Repository<Package>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(PackageContent)
    private readonly packageContentRepo: Repository<PackageContent>,
    private readonly transactionsService: TransactionsService,
  ) {}
  async enrollUserToPackage(packageId: number, userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const pkg = await this.pkgRepo.findOne({
      where: { id: packageId },
      relations: ['translations'],
    });
    if (!pkg) throw new NotFoundException('Package not found');

    const existing = await this.packageEnrollmentRepo.findOne({
      where: { user: { id: userId }, package: { id: packageId } },
    });
    if (existing) throw new BadRequestException('Already enrolled in package');

    const packageEnrollment = this.packageEnrollmentRepo.create({
      user,
      package: pkg,
      status: 0,
    });

    const savedPackageEnrollment =
      await this.packageEnrollmentRepo.save(packageEnrollment);

    const pkgContents = await this.contentRepo
      .createQueryBuilder('c')
      .innerJoin(
        'package_content',
        'pc',
        'pc.content_id = c.id AND pc.package_id = :pid AND pc.is_active = 1',
        { pid: packageId },
      )
      .getMany();

    const enrollments = pkgContents.map((c) =>
      this.enrollmentRepo.create({
        user,
        content: c,
        status: 0,
        rating: 0,
        packageEnrollment: savedPackageEnrollment,
      }),
    );

    const savedEnrollments = await this.enrollmentRepo.save(enrollments);

    await this.transactionsService.logAction({
      tableName: 'package_enrollments',
      type: TransactionType.ENROLL,
      recordId: savedPackageEnrollment.id,
      payload: {
        entity: 'package_enrollment',
        packageId,
        userId,
        enrollmentIds: savedEnrollments.map((item) => item.id),
      },
    });

    return savedPackageEnrollment;
  }

  /** إلغاء التسجيل من الباكدج */
  async unenrollUserFromPackage(packageId: number, userId: number) {
    const packageEnrollment = await this.packageEnrollmentRepo.findOne({
      where: { user: { id: userId }, package: { id: packageId } },
    });

    if (!packageEnrollment) {
      throw new NotFoundException('Package enrollment not found');
    }

    const relatedEnrollments = await this.enrollmentRepo.find({
      where: { packageEnrollment: { id: packageEnrollment.id } },
      select: ['id'],
    });

    await this.transactionsService.logAction({
      tableName: 'package_enrollments',
      type: TransactionType.UNENROLL,
      recordId: packageEnrollment.id,
      payload: {
        entity: 'package_enrollment',
        packageId,
        userId,
        relatedEnrollmentIds: relatedEnrollments.map((item) => item.id),
      },
    });

    await this.enrollmentRepo.delete({
      packageEnrollment: { id: packageEnrollment.id },
    });

    await this.packageEnrollmentRepo.remove(packageEnrollment);

    return { message: 'Unenrolled successfully' };
  }

  /** تحديث حالة الباكدج بناءً على محتوياته */
  // async updatePackageStatus(packageEnrollmentId: number) {
  //   const contentsEnrollment = await this.enrollmentRepo.find({
  //     where: { packageEnrollment: { id: packageEnrollmentId } },
  //   });

  //   const allCompleted = contentsEnrollment.every((e) => e.status === 1);

  //   if (allCompleted) {
  //     await this.packageEnrollmentRepo.update(packageEnrollmentId, {
  //       status: 1,
  //     });
  //   }

  //   return allCompleted;
  // }
  async getPackageContentsEnrollment(
    packageId: number,
    userId: number,
    languageId?: number,
  ) {
    // 1. هات كل محتويات الباكيدج النشطة مع الترجمات
    const pkgContents = await this.packageContentRepo.find({
      where: { package: { id: packageId }, is_active: 1 },
      relations: [
        'content',
        'content.translations',
        'content.translations.language',
      ],
      order: { order_no: 'ASC' },
    });

    // 2. هات حالة التسجيل لكل محتوى
    const enrollments = await this.enrollmentRepo.find({
      where: {
        user: { id: userId },
        content: { id: In(pkgContents.map((pc) => pc.content.id)) },
      },
    });

    // 3. رتب الرد على حسب اللغة لو موجودة
    return pkgContents.map((pc) => {
      const enr = enrollments.find((e) => e.content.id === pc.content.id);

      let translations: ContentTranslation[];
      if (languageId) {
        translations = pc.content.translations.filter(
          (t) => t.language.id === languageId,
        );
      } else {
        translations = pc.content.translations;
      }

      return {
        contentId: pc.content.id,
        translations: translations.map((t) => ({
          languageId: t.language.id,
          languageName: t.language.name,
          contentName: t.name,
          description: t.description,
        })),
        status: enr?.status ?? 0,
        rating: enr?.rating ?? 0,
        enrolled: !!enr,
      };
    });
  }

  async checkCompletion(
    packageId: number,
    userId: number,
    languageId?: number,
  ) {
    // هات كل محتويات الباكيدج
    const pkgContents = await this.packageContentRepo.find({
      where: { package: { id: packageId }, is_active: 1 },
      relations: ['content'],
    });

    // هات كل الـ enrollments للمستخدم
    const enrollments = await this.enrollmentRepo.find({
      where: {
        user: { id: userId },
        content: { id: In(pkgContents.map((pc) => pc.content.id)) },
      },
    });

    // احسب إذا كل المحتويات مكتملة
    const allCompleted = pkgContents.every((pc) =>
      enrollments.some((e) => e.content.id === pc.content.id && e.status === 1),
    );

    // احسب عدد المحتويات المكتملة
    const completedContentsCount = enrollments.filter(
      (e) => e.status === 1,
    ).length;

    // نسبة مئوية
    const percentage = pkgContents.length
      ? Math.round((completedContentsCount / pkgContents.length) * 100)
      : 0;
    const userPackageEnrollment = await this.packageEnrollmentRepo.findOne({
      where: {
        user: { id: userId },
        package: { id: packageId },
      },
    });
    const enrolledAtFormatted = userPackageEnrollment?.created_at
      ? userPackageEnrollment.created_at.toLocaleString()
      : null;
    // هات اسم الباكيدج بالـ languageId إذا موجود
    const packageEntity = await this.pkgRepo.findOne({
      where: { id: packageId },
      relations: ['translations', 'translations.language'],
    });

    let packageName: string | { title: string }[] = 'Package Name Not Found';
    if (packageEntity) {
      if (languageId) {
        const translation = packageEntity.translations.find(
          (t) => t.language.id === languageId,
        );
        packageName =
          translation?.title ??
          packageEntity.translations[0]?.title ??
          packageName;
      } else {
        // لو مفيش languageId، رجع كل الترجمات كـ array
        packageName = packageEntity.translations.map((t) => ({
          languageId: t.language.id,
          languageName: t.language.name,
          title: t.title,
        }));
      }
    }

    return {
      packageId,
      userId,
      packageName,
      totalContents: pkgContents.length,
      completedContents: completedContentsCount,
      allCompleted,
      percentage,
      enrolledAt: enrolledAtFormatted,
    };
  }
  async checkAllUserPackagesCompletion(userId: number, languageId?: number) {
    // هات كل اشتراكات الباكدجات للمستخدم
    const userPackageEnrollments = await this.packageEnrollmentRepo.find({
      where: {
        user: { id: userId },
      },
      relations: ['package', 'user'],
      order: {
        created_at: 'DESC',
      },
    });

    if (!userPackageEnrollments.length) {
      return [];
    }

    const results = await Promise.all(
      userPackageEnrollments.map(async (userPackageEnrollment) => {
        const packageId = userPackageEnrollment.package.id;

        // هات كل محتويات الباكدج
        const pkgContents = await this.packageContentRepo.find({
          where: {
            package: { id: packageId },
            is_active: 1,
          },
          relations: ['content'],
        });

        const contentIds = pkgContents.map((pc) => pc.content.id);

        // هات enrollments الخاصة بالمستخدم في محتويات الباكدج
        const enrollments = contentIds.length
          ? await this.enrollmentRepo.find({
              where: {
                user: { id: userId },
                content: { id: In(contentIds) },
              },
              relations: ['content'],
            })
          : [];

        // احسب هل كل المحتويات مكتملة
        const allCompleted = pkgContents.every((pc) =>
          enrollments.some(
            (e) => e.content.id === pc.content.id && e.status === 1,
          ),
        );

        // عدد المحتويات المكتملة
        const completedContentsCount = enrollments.filter(
          (e) => e.status === 1,
        ).length;

        // النسبة المئوية
        const percentage = pkgContents.length
          ? Math.round((completedContentsCount / pkgContents.length) * 100)
          : 0;

        // هات اسم الباكدج بالترجمة
        const packageEntity = await this.pkgRepo.findOne({
          where: { id: packageId },
          relations: ['translations', 'translations.language'],
        });

        let packageName:
          | string
          | { languageId: number; languageName: string; title: string }[] =
          'Package Name Not Found';

        if (packageEntity) {
          if (languageId) {
            const translation = packageEntity.translations.find(
              (t) => t.language.id === languageId,
            );

            packageName =
              translation?.title ??
              packageEntity.translations[0]?.title ??
              packageName;
          } else {
            packageName = packageEntity.translations.map((t) => ({
              languageId: t.language.id,
              languageName: t.language.name,
              title: t.title,
            }));
          }
        }

        return {
          packageId,
          userId,
          packageName,
          totalContents: pkgContents.length,
          completedContents: completedContentsCount,
          allCompleted,
          percentage,
          enrolledAt: userPackageEnrollment.created_at
            ? userPackageEnrollment.created_at.toLocaleString()
            : null,
        };
      }),
    );

    return results;
  }
}
