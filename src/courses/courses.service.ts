import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Repository } from 'typeorm';
import { Language } from 'src/languages/entities/language.entity';
import { CourseTranslation } from './entities/course-translation.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(CourseTranslation)
    private courseTranslationRepository: Repository<CourseTranslation>,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    const course = this.courseRepository.create({
      image: createCourseDto.image,
    });
    const savedCourse = await this.courseRepository.save(course);
    const translations = await Promise.all(
      createCourseDto.translations.map(async (translation) => {
        const language = await this.languageRepository.findOne({
          where: { id: translation.languageId },
        });
        if (!language) {
          throw new Error(
            `Language with ID ${translation.languageId} not found`,
          );
        }
        const courseTranslation = this.courseTranslationRepository.create({
          name: translation.name,
          description: translation.description,
          course: savedCourse,
          language: language,
        });
        return this.courseTranslationRepository.save(courseTranslation);
      }),
    );
    return { ...savedCourse, translations };
  }

  async findAll(languageId?: number) {
    const courses = await this.courseRepository.find({
      relations: ['translations', 'translations.language'],
    });
    return courses.map((course) => {
      const selectedTranslations =
        course.translations.find(
          (translation) => translation.language.id == languageId,
        ) || course.translations[0];
      return {
        id: course.id,
        image: course.image,
        name: selectedTranslations.name,
        description: selectedTranslations.description,
      };
    });
  }

  async findOne(id: number, languageId?: number) {
    const course = await this.courseRepository.findOne({
      where: { id: id },
      relations: ['translations', 'translations.language'],
    });

    if (!course) {
      throw new NotFoundException(`Course ${id} not found`);
    }

    const selectedTranslation =
      course.translations.find((t) => t.language.id === languageId) ||
      course.translations[0]; // Fallback to first translation

    return {
      id: course.id,
      image: course.image,
      name: selectedTranslation?.name,
      description: selectedTranslation?.description,
    };
  }

  async update(id: number, UpdateCourseDto: UpdateCourseDto) {
    const course = await this.courseRepository.findOne({
      where: { id: id },
      relations: ['translations', 'translations.language'],
    });
    if (!course) throw new NotFoundException(`Bundle ${id} not found`);
    if (UpdateCourseDto.translations) {
      for (const t of UpdateCourseDto.translations) {
        const language = await this.languageRepository.findOne({
          where: { id: t.languageId },
        });
        if (!language)
          throw new NotFoundException(`Language ${t.languageId} not found`);
        const translation = await this.courseTranslationRepository.findOne({
          where: { course: { id }, language: { id: t.languageId } },
        });
        if (translation) {
          translation.name = t.name;
          translation.description = t.description;
          await this.courseTranslationRepository.save(translation);
        } else {
          const newTranslation = this.courseTranslationRepository.create({
            name: t.name,
            description: t.description,
            language,
            course,
          });
          await this.courseTranslationRepository.save(newTranslation);
        }
      }
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    const course = await this.courseRepository.findOne({ where: { id: id } });
    if (!course) throw new NotFoundException(`Bundle ${id} not found`);
    await this.courseRepository.softDelete(id);
    return { message: `Bundle ${id} removed` };
  }
}
