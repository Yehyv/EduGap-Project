import { Module } from '@nestjs/common';
import { LessonReactionsService } from './lesson-reactions.service';
import { LessonReactionsController } from './lesson-reactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonReaction } from './entities/lesson-reaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LessonReaction])],
  controllers: [LessonReactionsController],
  providers: [LessonReactionsService],
})
export class LessonReactionsModule {}
