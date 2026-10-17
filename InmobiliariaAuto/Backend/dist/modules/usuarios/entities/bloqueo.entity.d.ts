import { Usuario } from './usuario.entity';
export declare class Bloqueo {
    id: string;
    bloqueadorId: string;
    bloqueador: Usuario;
    bloqueadoId: string;
    bloqueado: Usuario;
    creado: Date;
}
