import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  Allow,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class ExcelStudentRowDto {
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString()
  @MinLength(3, { message: 'Full name must be at least 3 characters' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  full_name: string;

  /**
   * 🔥 THE ULTIMATE FIX:
   * 1. Transform empty strings to undefined
   * 2. Use IsOptional to skip validation if undefined
   * 3. Apply IsEmail only when value exists
   */
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    return value;
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsNotEmpty({ message: 'Phone is required' })
  @IsString()
  @Matches(/^[0-9]{10,15}$/, {
    message: 'Phone must be 10-15 digits',
  })
  phone: string;

  @IsNotEmpty({ message: 'National ID is required' })
  @IsString()
  @Matches(/^[0-9]{14}$/, {
    message: 'National ID must be exactly 14 digits',
  })
  national_id: string;

  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    return value;
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{1,20}$/, {
    message: 'Student ID must be numeric',
  })
  student_id?: string;
}