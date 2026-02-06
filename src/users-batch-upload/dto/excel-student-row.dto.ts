import { IsString, IsEmail, Length, IsOptional } from 'class-validator';

export class ExcelStudentRowDto {
  @IsString()
  @Length(1, 150)
  full_name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @Length(6, 20)
  phone: string;

  @IsString()
  @Length(14, 14)
  national_id: string;

  @IsOptional()
  @IsString()
  student_id?: string;
}
