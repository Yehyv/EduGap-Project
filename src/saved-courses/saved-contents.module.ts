import { Module } from '@nestjs/common';
import { SavedContentsService } from './saved-contents.service';
import { SavedContentsController } from './saved-contents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedContent } from './entities/saved-content.entity';
import { User } from 'src/users/entities/user.entity';
import { Content } from 'src/contents/entities/content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavedContent, User, Content])],
  controllers: [SavedContentsController],
  providers: [SavedContentsService],
})
export class SavedContentsModule {}
