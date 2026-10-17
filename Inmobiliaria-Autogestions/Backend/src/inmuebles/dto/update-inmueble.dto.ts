import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateInmuebleDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  tipo?: number;

  @IsString()
  @IsOptional()
  ciudad?: string;

  @IsString()
  @IsOptional()
  zona?: string;

  @IsString()
  @IsOptional()
  calle?: string;

  @IsString()
  @IsOptional()
  referencia?: string;

  @IsObject()
  @IsOptional()
  direccion?: Record<string, any>;

  @IsObject()
  @IsOptional()
  direccion_fk?: Record<string, any>;

  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : null))
  @IsOptional()
  precio?: number | null;

  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : null))
  @IsOptional()
  valor_activo?: number | null;

  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : null))
  @IsOptional()
  superficie?: number | null;

  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : null))
  @IsOptional()
  largo?: number | null;

  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : null))
  @IsOptional()
  ancho?: number | null;

  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  habitaciones?: number;

  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  banos?: number;

  @Transform(({ value }) => (value !== undefined ? value === true || value === 'true' : undefined))
  @IsBoolean()
  @IsOptional()
  garaje?: boolean;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  gps?: string;

  @IsString()
  @IsOptional()
  verificacion_estado?: string;
}
