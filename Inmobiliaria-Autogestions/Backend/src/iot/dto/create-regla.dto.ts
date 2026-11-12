import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReglaAccesoDto {
  @IsNotEmpty()
  @IsNumber()
  dispositivo_id: number;

  @IsNotEmpty()
  @IsNumber()
  usuario_id: number;

  @IsOptional()
  @IsNumber()
  contrato_id?: number;

  @IsOptional()
  @IsString()
  tipo_acceso?: string; // 'contrato' | 'visita_agendada' | 'mantenimiento' | 'temporal'

  @IsNotEmpty()
  @IsString()
  fecha_inicio: string;

  @IsOptional()
  @IsString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  pin_codigo?: string;
}
