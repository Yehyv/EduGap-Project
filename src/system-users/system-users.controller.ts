import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { SystemUsersService } from './system-users.service';
import { CreateSystemUserDto } from './dto/create-system-user.dto';
import { UpdateSystemUserDto } from './dto/update-system-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Headers, Req } from '@nestjs/common';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId?: number;
    refreshToken?: string;
  };
}
@Controller('system-users')
export class SystemUsersController {
  constructor(private readonly systemUsersService: SystemUsersService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(@Body() createSystemUserDto: CreateSystemUserDto) {
    return this.systemUsersService.create(createSystemUserDto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('super-admin/users/list')
  findAll() {
    return this.systemUsersService.findAll();
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('super-admin/user/:id')
  findOne(@Param('id') id: string) {
    return this.systemUsersService.findOne(+id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('super-admin/user/:id')
  update(
    @Param('id') id: string,
    @Body() updateSystemUserDto: UpdateSystemUserDto,
  ) {
    return this.systemUsersService.update(+id, updateSystemUserDto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN') // غالبًا system user يتحكم فيه سوبر فقط
  @Delete('super-admin/user/:id')
  remove(@Param('id') id: string) {
    return this.systemUsersService.remove(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN') // غالبًا system user يتحكم فيه سوبر فقط
  @Patch('super-admin/system-user-status/:id')
  async changeSystemUserStatus(@Param('id', ParseIntPipe) id: number) {
    return this.systemUsersService.toggleActive(id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INST_ADMIN')
  @Get('me/minimal')
  getInstAdminMinimal(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    return this.systemUsersService.getInstAdminMinimal(
      req.user.sub,
      languageId ? Number(languageId) : undefined,
    );
  }
}
