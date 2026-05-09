import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { ProductType } from '../enums/product-type.enum';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  preco?: number;

  @IsNumber()
  @Min(0)
  quantidade!: number;

  @IsEnum(ProductType)
  tipo!: ProductType;
}
