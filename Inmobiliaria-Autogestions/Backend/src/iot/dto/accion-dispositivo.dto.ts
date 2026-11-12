import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AccionDispositivoDto {
  @IsNotEmpty()
  @IsString()
  accion: 'desbloquear' | 'bloquear' | 'generar_pin' | 'verificar_estado';

  @IsOptional()
  @IsString()
  pin?: string;

  @IsOptional()
  @IsString()
  metodo?: 'app' | 'pin' | 'bluetooth' | 'remoto_emergencia';
}
