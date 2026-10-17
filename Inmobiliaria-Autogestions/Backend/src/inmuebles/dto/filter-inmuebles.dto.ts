import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterInmueblesDto {
  @IsString()
  @IsOptional()
  search?: string;

  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  tipo?: number;

  @IsString()
  @IsOptional()
  ciudad?: string;

  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  precio_max?: number;

  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  habitaciones_min?: number;

  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  banos_min?: number;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  garaje?: boolean;

  @IsString()
  @IsOptional()
  tipo_oferta?: string;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  personal?: boolean;
}
