import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateStockEntryDto {
  @IsUUID()
  produto_id!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  quantidade!: number;

  @IsOptional()
  @IsString()
  motivo?: string;
}
