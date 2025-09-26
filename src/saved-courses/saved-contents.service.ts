import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedContent } from './entities/saved-content.entity';
import { User } from 'src/users/entities/user.entity';
import { Content } from 'src/contents/entities/content.entity';
import { skip } from 'rxjs';

@Injectable()
export class SavedContentsService {
  constructor(
    @InjectRepository(SavedContent)
    private savedContentRepository: Repository<SavedContent>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async saveContent(
    contentId: number,
    userId: number,
    userInstituteId?: number,
  ) {
    // التأكد من وجود اليوزر
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // التأكد من وجود الكورس
    if (userInstituteId) {
      const content = await this.contentRepository
        .createQueryBuilder('content')
        .leftJoin('content.courses', 'course')
        .leftJoin('course.programs', 'program')
        .leftJoin('program.institutes', 'institute')
        .where('content.id = :contentId', { contentId })
        .andWhere('institute.id = :instituteId', {
          instituteId: userInstituteId,
        })
        .getOne();
      if (!content) {
        throw new BadRequestException(
          `Content ${contentId} not found or not accessible`,
        );
      }

      // التأكد إن الكورس مش محفوظ من قبل
      const existingSavedContent = await this.savedContentRepository.findOne({
        where: {
          content: { id: contentId },
          user: { id: userId },
        },
      });

      if (existingSavedContent) {
        throw new BadRequestException('Content already saved');
      }

      // حفظ الكورس
      const savedContent = this.savedContentRepository.create({
        content,
        user,
      });

      await this.savedContentRepository.save(savedContent);
      return { message: 'content saved' };
    }
  }

  async unsaveContent(contentId: number, userId: number) {
    const savedContent = await this.savedContentRepository.findOne({
      where: {
        content: { id: contentId },
        user: { id: userId },
      },
    });

    if (!savedContent) {
      throw new NotFoundException('Saved content not found');
    }

    await this.savedContentRepository.remove(savedContent);
    return { message: 'Content unsaved successfully' };
  }

  async getUserSavedContent(
    userId: number,
    userInstituteId?: number,
    languageId?: number,
    page: number = 1,
    limit: number = 8,
  ) {
    const skip = (page - 1) * limit;
    const query = this.savedContentRepository
      .createQueryBuilder('savedContent')
      .leftJoinAndSelect('savedContent.content', 'content')
      .leftJoinAndSelect('content.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('content.courses', 'course')
      .leftJoinAndSelect('content.contentCategory', 'category')
      .leftJoinAndSelect(
        'category.translations',
        'categoryTranslation',
        languageId ? 'categoryTranslation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('content.educators', 'educators')
      .leftJoinAndSelect('educators.user', 'educatorUser')
      .leftJoinAndSelect('course.programs', 'program')
      .leftJoinAndSelect('program.institutes', 'institute')
      .innerJoin('savedContent.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('savedContent.savedAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (userInstituteId) {
      query.andWhere('institute.id = :instituteId', {
        instituteId: userInstituteId,
      });
    }

    if (languageId) {
      query.andWhere('translation.languageId = :languageId', { languageId });
    }

    const [savedContent, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);
    if (!savedContent.length) {
      throw new NotFoundException('No saved contents found');
    }
    const formattedContents = savedContent.map((savedContent) => {
      const selectedTranslation = savedContent.content.translations[0] || null;
      return {
        id: savedContent.content.id,
        image: savedContent.content.image,
        rate: savedContent.content.rate,
        level: savedContent.content.level,
        numberOfReviewers: savedContent.content.numberOfReviewers ?? 0,
        levelName: selectedTranslation?.levelName || '',
        whatToLearn: selectedTranslation?.whatToLearn || '',
        name: selectedTranslation?.name || '',
        description: selectedTranslation?.description || '',
        durationTime: selectedTranslation?.durationTime || '',
        educators: savedContent.content.educators.map((e) => ({
          id: e.id,
          title: e.title,
          bio: e.bio,
          image: e.image,
          firstName: e.user.firstName,
          lastName: e.user.lastName,
        })),
        category: {
          id: savedContent.content.contentCategory?.id,
          name:
            savedContent.content.contentCategory?.translations?.[0]?.name || '',
        },
      };
    });
    return {
      formattedContents,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
  async getFirstEight(
    userId: number,
    userInstituteId?: number,
    languageId?: number,
  ) {
    const query = this.savedContentRepository
      .createQueryBuilder('savedContent')
      .leftJoinAndSelect('savedContent.content', 'content')
      .leftJoinAndSelect('content.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('content.courses', 'course')
      .leftJoinAndSelect('content.contentCategory', 'category')
      .leftJoinAndSelect(
        'category.translations',
        'categoryTranslation',
        languageId ? 'categoryTranslation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('content.educators', 'educators')
      .leftJoinAndSelect('educators.user', 'educatorUser')
      .leftJoinAndSelect('course.programs', 'program')
      .leftJoinAndSelect('program.institutes', 'institute')
      .innerJoin('savedContent.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('savedContent.savedAt', 'DESC')
      .take(8);

    if (userInstituteId) {
      query.andWhere('institute.id = :instituteId', {
        instituteId: userInstituteId,
      });
    }

    if (languageId) {
      query.andWhere('translation.languageId = :languageId', { languageId });
    }

    const savedContent = await query.getMany();

    if (!savedContent.length) {
      throw new NotFoundException('No saved contents found');
    }

    const formattedContents = savedContent.map((savedContent) => {
      const selectedTranslation = savedContent.content.translations[0] || null;
      return {
        id: savedContent.content.id,
        image: savedContent.content.image,
        rate: savedContent.content.rate,
        level: savedContent.content.level,
        numberOfReviewers: savedContent.content.numberOfReviewers ?? 0,
        levelName: selectedTranslation?.levelName || '',
        whatToLearn: selectedTranslation?.whatToLearn || '',
        name: selectedTranslation?.name || '',
        description: selectedTranslation?.description || '',
        durationTime: selectedTranslation?.durationTime || '',
        educators: savedContent.content.educators.map((e) => ({
          id: e.id,
          title: e.title,
          bio: e.bio,
          image: e.image,
          firstName: e.user.firstName,
          lastName: e.user.lastName,
        })),
        category: {
          id: savedContent.content.contentCategory?.id,
          name:
            savedContent.content.contentCategory?.translations?.[0]?.name || '',
        },
      };
    });
    return formattedContents;
  }

  // دالة للتأكد إن الكورس محفوظ ولا لا
  async isContentsSaved(contentId: number, userId: number): Promise<boolean> {
    const savedContent = await this.savedContentRepository.findOne({
      where: {
        content: { id: contentId },
        user: { id: userId },
      },
    });

    return !!savedContent;
  }
}
