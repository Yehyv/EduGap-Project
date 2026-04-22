import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateApplyMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  institute_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  contact_person: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email_address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(5000)
  about_your_institute: string;
}
