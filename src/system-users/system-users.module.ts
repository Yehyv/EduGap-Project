import { Module } from '@nestjs/common';
import { SystemUsersService } from './system-users.service';
import { SystemUsersController } from './system-users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemUser } from './entities/system-user.entity';
import { Institute } from 'src/institutes/entities/institute.entity';
import { SystemRole } from 'src/system-roles/entities/system-role.entity';
import { ActivationLog } from 'src/users/entities/activation-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemUser,
      Institute,
      SystemRole,
      ActivationLog,
    ]),
  ],
  controllers: [SystemUsersController],
  providers: [SystemUsersService],
  exports: [SystemUsersService],
})
export class SystemUsersModule {}
