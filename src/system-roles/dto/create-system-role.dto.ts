import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RoleCategory } from 'src/common/enums/role-category.enum';
export class CreateSystemRoleDto {
  @IsString()
  @IsNotEmpty()
  role_title: string;

  @Transform(({ value }: { value: unknown }) => {
    // If it's already a number, return it
    if (typeof value === 'number') return value;

    // If it's a string, convert enum key to value
    if (typeof value === 'string' && value in RoleCategory) {
      return RoleCategory[value as keyof typeof RoleCategory];
    }

    return value;
  })
  @IsEnum(RoleCategory)
  @IsNotEmpty()
  role_category: RoleCategory;
}
