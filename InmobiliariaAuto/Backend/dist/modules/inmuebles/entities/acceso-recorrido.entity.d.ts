import { Inmueble } from './inmueble.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
export declare class AccesoRecorrido360 {
    id: string;
    inmuebleId: string;
    inmueble: Inmueble;
    clienteId: string;
    cliente: Usuario;
    propietarioId: string;
    propietario: Usuario;
    fechaExpiracion: Date;
    activo: boolean;
    visitas: number;
    creado: Date;
}
