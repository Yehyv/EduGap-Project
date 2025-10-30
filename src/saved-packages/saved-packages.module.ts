import { Module } from '@nestjs/common';
import { SavedPackagesService } from './saved-packages.service';
import { SavedPackagesController } from './saved-packages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedPackage } from './entities/saved-package.entity';
import { Package } from 'src/packages/entities/package.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavedPackage, Package, User])],
  controllers: [SavedPackagesController],
  providers: [SavedPackagesService],
})
export class SavedPackagesModule {}
