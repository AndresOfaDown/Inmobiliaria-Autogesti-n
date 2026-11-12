import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateContratoDto {
  @IsNotEmpty()
  @IsNumber()
  inmueble_id: number;

  @IsNotEmpty()
  @IsNumber()
  inquilino_id: number;

  @IsOptional()
  @IsNumber()
  tipo_contrato_id?: number;

  @IsNotEmpty()
  monto: number | string;

  @IsOptional()
  @IsString()
  moneda?: string;

  @IsOptional()
  deposito?: number | string;

  @IsOptional()
  dia_pago?: number;

  @IsOptional()
  @IsString()
  forma_pago?: string;

  @IsNotEmpty()
  @IsString()
  inicio: string;

  @IsOptional()
  @IsString()
  fin?: string;

  @IsOptional()
  @IsString()
  antecedentes?: string;

  @IsOptional()
  @IsString()
  clausulas?: string;

  @IsOptional()
  @IsString()
  clausulas_especiales?: string;

  @IsOptional()
  @IsString()
  uso_exclusivo?: string;

  @IsOptional()
  @IsString()
  condiciones_uso?: string;

  @IsOptional()
  @IsString()
  penalidades?: string;

  @IsOptional()
  @IsString()
  politica_cancelacion?: string;

  @IsOptional()
  @IsString()
  incluye_servicios?: string;

  @IsOptional()
  @IsString()
  restricciones?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  historial_chat?: any[];
}
