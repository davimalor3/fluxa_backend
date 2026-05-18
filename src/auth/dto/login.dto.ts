import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  @MinLength(5)
  @IsString()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  senha!: string;
}
