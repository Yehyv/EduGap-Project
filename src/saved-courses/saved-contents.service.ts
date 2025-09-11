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

      return this.savedContentRepository.save(savedContent);
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
  ) {
    const query = this.savedContentRepository
      .createQueryBuilder('savedContent')
      .leftJoinAndSelect('savedContent.content', 'content')
      .leftJoinAndSelect('content.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('content.courses', 'course')
      .leftJoinAndSelect('course.programs', 'program')
      .leftJoinAndSelect('program.institutes', 'institute')
      .innerJoin('savedContent.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('savedContent.savedAt', 'DESC');

    if (userInstituteId) {
      query.andWhere('institute.id = :instituteId', {
        instituteId: userInstituteId,
      });
    }

    if (languageId) {
      query.andWhere('translation.languageId = :languageId', { languageId });
    }

    const savedContents = await query.getMany();

    if (!savedContents.length) {
      throw new NotFoundException('No saved contents found');
    }

    return savedContents;
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

    const savedContents = await query.getMany();

    if (!savedContents.length) {
      throw new NotFoundException('No saved contents found');
    }

    return savedContents;
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
