import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Inmueble } from '../../inmuebles/entities/inmueble.entity';
import { Publicacion } from '../../inmuebles/entities/publicacion.entity';
import { Mensaje } from './mensaje.entity';
export declare class Chat {
    id: string;
    participante1Id: string;
    participante1: Usuario;
    participante2Id: string;
    participante2: Usuario;
    inmuebleId: string;
    inmueble: Inmueble;
    publicacionId: string;
    publicacion: Publicacion;
    mensajes: Mensaje[];
    creado: Date;
    actualizado: Date;
}
