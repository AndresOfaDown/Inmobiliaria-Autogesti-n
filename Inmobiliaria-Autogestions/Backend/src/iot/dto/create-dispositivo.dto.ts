import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDispositivoDto {
  @IsNotEmpty()
  @IsNumber()
  inmueble_id: number;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  tipo?: string; // 'cerradura' | 'sensor_apertura' | 'sensor_movimiento' | 'sensor_ambiental'

  @IsNotEmpty()
  @IsString()
  serial_id: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsString()
  codigo_maestro?: string;
}
