import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from 'src/contents/entities/content.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Content, Enrollment, User])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
