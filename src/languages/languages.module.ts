import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Language, SystemUser])],
  controllers: [LanguagesController],
  providers: [LanguagesService],
})
export class LanguagesModule {}
