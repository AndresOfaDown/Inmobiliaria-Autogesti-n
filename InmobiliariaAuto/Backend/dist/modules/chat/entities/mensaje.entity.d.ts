import { Chat } from './chat.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
export declare enum TipoMensaje {
    TEXTO = "texto",
    IMAGEN = "imagen",
    VIDEO = "video",
    UBICACION = "ubicacion",
    RECORRIDO360 = "recorrido360",
    WHATSAPP = "whatsapp"
}
export declare class Mensaje {
    id: string;
    chatId: string;
    chat: Chat;
    remitenteId: string;
    remitente: Usuario;
    tipo: TipoMensaje;
    contenido: string;
    archivoUrl: string;
    ubicacion: string;
    leido: boolean;
    creado: Date;
}
