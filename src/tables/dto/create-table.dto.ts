import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateTableDto {
  @IsInt()
  @Min(1)
  numero!: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  observacao?: string;
}
