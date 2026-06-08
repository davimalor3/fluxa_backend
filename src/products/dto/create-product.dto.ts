import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { produto_tipo, unidade_produto } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  preco?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  quantidade?: number;

  @IsEnum(produto_tipo)
  tipo!: produto_tipo;

  @IsEnum(unidade_produto)
  unidade_medida!: unidade_produto;

  @IsOptional()
  @IsBoolean()
  controla_estoque?: boolean = true;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean = true;
}
