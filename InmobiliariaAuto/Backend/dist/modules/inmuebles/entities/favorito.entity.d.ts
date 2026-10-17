import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Inmueble } from './inmueble.entity';
export declare class Favorito {
    id: string;
    usuarioId: string;
    usuario: Usuario;
    inmuebleId: string;
    inmueble: Inmueble;
    creado: Date;
}
