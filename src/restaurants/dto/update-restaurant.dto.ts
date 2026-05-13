import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  cnpj?: string;

  @IsOptional()
  @IsString()
  endereco?: string;
}
