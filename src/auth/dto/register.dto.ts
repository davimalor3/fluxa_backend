import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  restaurantName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  cnpj!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  endereco!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  managerName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  senha!: string;
}
