import { Module } from '@nestjs/common';
import { PrerequisitesController } from './prerequiest-contents.controller';
import { PrerequisitesService } from './prerequiest-contents.service';
import { PrerequisiteContent } from './entities/prerequiest-content.entity';
import { Content } from 'src/contents/entities/content.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PrerequisiteContent, Content])],
  controllers: [PrerequisitesController],
  providers: [PrerequisitesService],
})
export class PrerequiestContentsModule {}
