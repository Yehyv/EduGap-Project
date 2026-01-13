import { Module } from '@nestjs/common';
import { SystemRolesService } from './system-roles.service';
import { SystemRolesController } from './system-roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemRole } from './entities/system-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemRole])],
  controllers: [SystemRolesController],
  providers: [SystemRolesService],
})
export class SystemRolesModule {}
