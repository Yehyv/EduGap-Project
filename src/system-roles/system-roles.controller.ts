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
} from '@nestjs/common';
import { SystemRolesService } from './system-roles.service';
import { CreateSystemRoleDto } from './dto/create-system-role.dto';
import { UpdateSystemRoleDto } from './dto/update-system-role.dto';
import { RoleCategory } from 'src/common/enums/role-category.enum';

@Controller('system-roles')
export class SystemRolesController {
  constructor(private readonly systemRolesService: SystemRolesService) {}

  @Post()
  create(@Body() createSystemRoleDto: CreateSystemRoleDto) {
    return this.systemRolesService.create(createSystemRoleDto);
  }

  @Get('super-admin/roles-list')
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 20;
    return this.systemRolesService.findAll(p, l);
  }
  @Get('super-admin/role-categories')
  getRoleCategories() {
    return Object.keys(RoleCategory).filter((key) => isNaN(Number(key)));
  }
  
  @Get('super-admin/role-titles')
  getSystemRolesForDropdown() {
    return this.systemRolesService.getSystemRolesForDropdown();
  }

  @Get('super-admin/role/:id')
  findOne(@Param('id') id: string) {
    return this.systemRolesService.findOne(+id);
  }

  @Patch('super-admin/:id')
  update(
    @Param('id') id: string,
    @Body() updateSystemRoleDto: UpdateSystemRoleDto,
  ) {
    return this.systemRolesService.update(+id, updateSystemRoleDto);
  }

  @Delete('super-admin/:id')
  remove(@Param('id') id: string) {
    return this.systemRolesService.remove(+id);
  }

  @Patch('super-admin/role-status/:id')
  async changeRoleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.systemRolesService.toggleActive(id);
  }

  @Patch('super-admin/:id/restore')
  restore(@Param('id') id: string) {
    return this.systemRolesService.restore(+id);
  }
}
