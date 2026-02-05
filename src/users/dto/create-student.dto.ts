import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Length,
  MinLength,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(14, 14, { message: 'National ID must be 14 digits' })
  national_id: string;

  @IsString()
  @Length(1, 3)
  phone_key: string;

  @IsString()
  @Length(6, 20)
  phone: string;

  @IsOptional()
  @IsString()
  user_image?: string;

  // 👇 بقوا اختياريين عشان الـ service بيولّدهم
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum([0, 1])
  is_verified?: number;

  @IsOptional()
  @IsString()
  refreshToken?: string | null;

  @IsOptional()
  @IsEnum([0, 1])
  verified_method?: number;

  @IsOptional()
  @IsEnum([0, 1])
  is_active?: number;

  @IsOptional()
  @IsEnum([0, 1])
  added_type?: number;

  @IsOptional()
  @IsNumber()
  studentId?: number;

  @IsOptional()
  @IsNumber()
  instituteId?: number;

  @IsOptional()
  @IsNumber()
  programId?: number;
}
