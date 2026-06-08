import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateGarcomDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  senha?: string;
}
