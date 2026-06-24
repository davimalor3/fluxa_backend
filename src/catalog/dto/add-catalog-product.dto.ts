import { IsNumber, IsUUID, Min } from 'class-validator';

export class AddCatalogProductDto {
  @IsUUID()
  catalogoProdutoId!: string;

  @IsNumber()
  @Min(0.001)
  quantidade!: number;
}
