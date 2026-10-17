import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateInmuebleDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : undefined))
  @IsNumber()
  @IsNotEmpty()
  tipo: number;

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

  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : 0))
  @IsNumber()
  @IsOptional()
  habitaciones?: number;

  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? Number(value) : 0))
  @IsNumber()
  @IsOptional()
  banos?: number;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  garaje?: boolean;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  gps?: string;
}
