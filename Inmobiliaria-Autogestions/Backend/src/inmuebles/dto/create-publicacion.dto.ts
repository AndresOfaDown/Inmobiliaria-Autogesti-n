import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePublicacionDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  inmueble: number;

  @IsString()
  @IsNotEmpty()
  tipo_oferta: string; // 'alquiler' | 'venta' | 'anticretico'

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  precio: number;

  @IsString()
  @IsOptional()
  estado?: string; // 'activa' | 'pausada' | 'finalizada'
}

export class UpdatePublicacionDto {
  @IsString()
  @IsOptional()
  tipo_oferta?: string;

  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  precio?: number;

  @IsString()
  @IsOptional()
  estado?: string;
}
