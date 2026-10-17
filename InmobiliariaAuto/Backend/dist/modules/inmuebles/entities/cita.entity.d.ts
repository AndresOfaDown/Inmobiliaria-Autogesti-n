import { Inmueble } from './inmueble.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
export declare enum EstadoCita {
    PENDIENTE = "pendiente",
    CONFIRMADA = "confirmada",
    CANCELADA = "cancelada",
    COMPLETADA = "completada"
}
export declare class Cita {
    id: string;
    inmuebleId: string;
    inmueble: Inmueble;
    clienteId: string;
    cliente: Usuario;
    propietarioId: string;
    propietario: Usuario;
    fecha: Date;
    horaInicio: string;
    horaFin: string;
    estado: EstadoCita;
    notas: string;
    creado: Date;
}
