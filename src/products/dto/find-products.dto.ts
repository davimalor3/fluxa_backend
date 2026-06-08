import { IsEnum, IsOptional } from 'class-validator';
import { produto_tipo } from '@prisma/client';

export class FindProductsDto {
  @IsOptional()
  @IsEnum(produto_tipo)
  tipo?: produto_tipo;
}
