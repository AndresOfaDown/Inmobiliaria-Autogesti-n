import { Usuario } from './usuario.entity';
export declare class Agenda {
    id: string;
    usuarioId: string;
    usuario: Usuario;
    titulo: string;
    descripcion: string;
    inicio: Date;
    fin: Date;
    ubicacion: string;
    completado: boolean;
    creado: Date;
}
