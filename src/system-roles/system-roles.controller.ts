import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SystemRolesService } from './system-roles.service';
import { CreateSystemRoleDto } from './dto/create-system-role.dto';
import { UpdateSystemRoleDto } from './dto/update-system-role.dto';
import { RoleCategory } from 'src/common/enums/role-category.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@Controller('system-roles')
export class SystemRolesController {
  constructor(private readonly systemRolesService: SystemRolesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createSystemRoleDto: CreateSystemRoleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.systemRolesService.create(createSystemRoleDto, req.user!.sub);
  }
  @UseGuards(JwtAuthGuard)
  @Get('super-admin/roles-list')
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 20;
    return this.systemRolesService.findAll(p, l);
  }
  @UseGuards(JwtAuthGuard)
  @Get('super-admin/role-categories')
  getRoleCategories() {
    return Object.keys(RoleCategory).filter((key) => isNaN(Number(key)));
  }
  @UseGuards(JwtAuthGuard)
  @Get('super-admin/role-titles')
  getSystemRolesForDropdown() {
    return this.systemRolesService.getSystemRolesForDropdown();
  }
  @UseGuards(JwtAuthGuard)
  @Get('super-admin/role/:id')
  findOne(@Param('id') id: string) {
    return this.systemRolesService.findOne(+id);
  }
  @UseGuards(JwtAuthGuard)
  @Roles('SUPER_ADMIN')
  @Patch('super-admin/:id')
  update(
    @Param('id') id: string,
    @Body() updateSystemRoleDto: UpdateSystemRoleDto,
  ) {
    return this.systemRolesService.update(+id, updateSystemRoleDto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete('super-admin/:id')
  remove(@Param('id') id: string) {
    return this.systemRolesService.remove(+id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('super-admin/role-status/:id')
  async changeRoleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.systemRolesService.toggleActive(id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('super-admin/:id/restore')
  restore(@Param('id') id: string) {
    return this.systemRolesService.restore(+id);
  }
}
