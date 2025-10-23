import { Module } from '@nestjs/common';
import { LessonReactionsService } from './lesson-reactions.service';
import { LessonReactionsController } from './lesson-reactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonReaction } from './entities/lesson-reaction.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LessonReaction, Lesson, User])],
  controllers: [LessonReactionsController],
  providers: [LessonReactionsService],
})
export class LessonReactionsModule {}
