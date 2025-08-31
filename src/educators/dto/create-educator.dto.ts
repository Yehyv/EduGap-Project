import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { IsString, IsNotEmpty } from 'class-validator';
export class CreateEducatorDto extends CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  bio: string;
}
