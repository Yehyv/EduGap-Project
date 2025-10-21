import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Headers,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    console.log('IBRAHIIIIIIIIIIIIIIM');
    return this.usersService.findAll();
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMeMinimal(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.usersService.getMeMinimal(req.user.sub, langId);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    console.log('=== Controller.findById ===');
    console.log('Received ID:', id);

    try {
      const result = await this.usersService.findById(id);
      console.log('Controller returning:', result.id);
      return result;
    } catch (error) {
      console.log('Error in controller:', error.message);
      throw error; // إعادة throw عشان الـ Exception Filter يشتغل
    }
  }
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(+id);
  }
  @Patch(':id/assign-institute/:instituteId')
  async assignUserToInstitute(
    @Param('id') userId: number,
    @Param('instituteId') instituteId: number,
  ) {
    return this.usersService.assignUserToInstitute(userId, instituteId);
  }
  @Post('change-password')
  async changePassword(
    @Body()
    body: {
      userId: number;
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    return this.usersService.changePassword(
      body.userId,
      body.oldPassword,
      body.newPassword,
      body.confirmPassword,
    );
  }
  @Patch(':id/assign-program/:programId')
  assignUserToProgram(
    @Param('id', ParseIntPipe) userId: number,
    @Param('programId', ParseIntPipe) programId: number,
  ) {
    return this.usersService.assignUserToProgram(userId, programId);
  }
}
