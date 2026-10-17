import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateHorarioDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  inmueble: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  dia_semana: number; // 0..6

  @IsString()
  @IsNotEmpty()
  hora_inicio: string;

  @IsString()
  @IsNotEmpty()
  hora_fin: string;

  @Transform(({ value }) => (value !== undefined ? value === true || value === 'true' : true))
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
