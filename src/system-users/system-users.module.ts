import { Module } from '@nestjs/common';
import { SystemUsersService } from './system-users.service';
import { SystemUsersController } from './system-users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemUser } from './entities/system-user.entity';
import { SystemRole } from './entities/system-role.entity';
import { Institute } from 'src/institutes/entities/institute.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemUser, SystemRole, Institute])],
  controllers: [SystemUsersController],
  providers: [SystemUsersService],
})
export class SystemUsersModule {}
