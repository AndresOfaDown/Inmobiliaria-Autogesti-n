import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Inmueble } from './inmueble.entity';
export declare class HorarioDisponible {
    id: string;
    propietarioId: string;
    propietario: Usuario;
    inmuebleId: string;
    inmueble: Inmueble;
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    activo: boolean;
}
