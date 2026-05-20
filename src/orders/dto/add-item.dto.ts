import { IsUUID, IsNumber, Min } from 'class-validator';

export class AddItemDto {
  @IsUUID()
  produto_id!: string;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  quantidade!: number;
}
