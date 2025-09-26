import { CreateUserDto } from 'src/users/dto/create-user.dto';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
export class CreateEducatorDto extends CreateUserDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  bio: string;

  @IsNotEmpty()
  @IsString()
  image: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rate?: number;
}
