import { IsOptional, IsString } from 'class-validator';

export class AnalyticsFilterDto {
  @IsOptional()
  @IsString()
  inicio?: string;

  @IsOptional()
  @IsString()
  fim?: string;

  @IsOptional()
  @IsString()
  periodo?: 'hoje' | '7d' | '30d' | 'mes';
}
