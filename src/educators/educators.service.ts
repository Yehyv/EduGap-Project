import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEducatorDto } from './dto/create-educator.dto';
import { UpdateEducatorDto } from './dto/update-educator.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Educator } from './entities/educator.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class EducatorsService {
  constructor(
    @InjectRepository(Educator)
    private readonly educatorRepository: Repository<Educator>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private userService: UsersService,
  ) {}
  async create(createEducatorDto: CreateEducatorDto) {
    const user = this.userRepository.create({
      firstName: createEducatorDto.firstName,
      lastName: createEducatorDto.lastName,
      email: createEducatorDto.email,
      password: await bcrypt.hash(createEducatorDto.password, 10),
      role: 'educator',
      instituteId: createEducatorDto.instituteId,
    });
    const savedUser = await this.userRepository.save(user);
    const educator = this.educatorRepository.create({
      title: createEducatorDto.title,
      bio: createEducatorDto.bio,
      image: createEducatorDto.image,
      rate: createEducatorDto.rate,
      user: savedUser,
    });
    await this.educatorRepository.save(educator);
    // توليد التوكنز
    const tokens = await this.authService.getTokens(
      savedUser.id,
      savedUser.email,
      savedUser.instituteId,
    );
    await this.authService.updateRefreshToken(
      savedUser.id,
      tokens.refreshToken,
    );

    return tokens;
  }

  async findAll(page: number = 1, limit: number = 8) {
    const skip = (page - 1) * limit;

    const [educators, total] = await this.educatorRepository.findAndCount({
      relations: ['user'],
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: educators,
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
  async findFirst8Educators() {
    return this.educatorRepository.find({
      relations: ['user'],
      take: 8,
    });
  }
  async findOne(id: number, languageId: number, userInstituteId?: number) {
    // const educator = await this.educatorRepository.findOne({
    //   where: { id },
    //   relations: ['user'],
    // });
    // if (!educator)
    //   throw new NotFoundException(`Educator with id ${id} not found`);
    // return educator;
    const query = this.educatorRepository
      .createQueryBuilder('educator')
      .leftJoinAndSelect('educator.user', 'user')
      .leftJoinAndSelect('educator.contents', 'content')
      .leftJoinAndSelect(
        'content.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('translation.language', 'translationLanguage')
      .leftJoinAndSelect('content.contentCategory', 'category')
      .leftJoinAndSelect(
        'category.translations',
        'categoryTranslation',
        languageId ? 'categoryTranslation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect(
        'categoryTranslation.language',
        'categoryTranslationlanguage',
      )
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute');
    if (userInstituteId) {
      query.where('institute.id = :instituteId', {
        instuteId: userInstituteId,
      });
    }
    const educators = await query.getMany();
    const formatedEducators = educators.map((educator) => {
      return {
        id: educator.id,
        image: educator.image,
        title: educator.title,
        bio: educator.bio,
        rate: educator.rate,
        firstName: educator.user.firstName,
        lastName: educator.user.lastName,
        content: educator.contents.map((content) => {
          const contentTranslation = content.translations[0] || null;
          return {
            id: content.id,
            rate: content.rate,
            level: content.level,
            image: content.image,
            numberOfReviewers: content.numberOfReviewers ?? 0,
            name: contentTranslation?.name || '',
            levelName: contentTranslation?.levelName || '',
            category: {
              id: content.contentCategory?.id,
              name: content.contentCategory?.translations?.[0]?.name || '',
            },
          };
        }),
      };
    });
    return { formatedEducators };
  }

  async update(id: number, updateEducatorDto: UpdateEducatorDto) {
    const educator = await this.educatorRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!educator) {
      throw new NotFoundException(`Educator with ID ${id} not found`);
    }

    // وزّع الـ dto على الاتنين
    const { firstName, lastName, email, password, ...educatorData } =
      updateEducatorDto;

    // Update educator props
    Object.assign(educator, educatorData);

    // Update user props
    if (educator.user) {
      Object.assign(educator.user, { firstName, lastName, email });

      if (password) {
        educator.user.password = await this.userService.hashPassword(password);
      }
    }

    return this.educatorRepository.save(educator);
  }

  async remove(id: number) {
    await this.educatorRepository.softDelete(id);
    return { message: 'Educator deleted successfully' };
  }
}
