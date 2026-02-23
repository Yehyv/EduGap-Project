import { Module } from '@nestjs/common';
import { SystemRolesService } from './system-roles.service';
import { SystemRolesController } from './system-roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemRole } from './entities/system-role.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemRole, SystemUser])],
  controllers: [SystemRolesController],
  providers: [SystemRolesService],
})
export class SystemRolesModule {}
