import { Module } from '@nestjs/common';
import { UsersBatchUploadService } from './users-batch-upload.service';
import { UsersBatchUploadController } from './users-batch-upload.controller';
import { UsersBatchUpload } from './entities/users-batch-upload.entity';
import { UsersBatchUploadError } from './entities/users_batch_upload_errors.entity';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemRole } from 'src/system-roles/entities/system-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersBatchUpload,
      UsersBatchUploadError,
      User,
      SystemRole,
    ]),
  ],
  controllers: [UsersBatchUploadController],
  providers: [UsersBatchUploadService],
})
export class UsersBatchUploadModule {}
