// src/educators/dto/create-educator.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsIn, IsInt } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class CreateEducatorDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  bio: string;

  @IsString()
  @IsOptional()
  video_intro?: string;

  @IsOptional()
  @IsIn([0, 1])
  is_active?: number; // default 1

  @IsInt()
  userId: number; // ربط باليوزر
}
