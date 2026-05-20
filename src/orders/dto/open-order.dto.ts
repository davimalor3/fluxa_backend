import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';

export class OpenOrderDto {
  @IsUUID()
  mesa_id!: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  observacao?: string;
}
