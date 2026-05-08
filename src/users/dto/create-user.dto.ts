import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { user_role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  nome!: string;

  @IsEmail()
  email!: string;

  @MinLength(6)
  senha!: string;

  @IsEnum(user_role)
  role!: user_role;

  @IsString()
  restaurante_id!: string;
}
