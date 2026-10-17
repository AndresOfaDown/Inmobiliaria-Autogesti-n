import { Usuario } from './usuario.entity';
export declare class Resena {
    id: string;
    usuarioId: string;
    usuario: Usuario;
    inmuebleId: string;
    calificacion: number;
    comentario: string;
    creado: Date;
}
