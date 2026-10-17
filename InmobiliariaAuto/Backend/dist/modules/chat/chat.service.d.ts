import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { Mensaje, TipoMensaje } from './entities/mensaje.entity';
import { UsersService } from '../usuarios/users.service';
export declare class ChatService {
    private chatRepo;
    private mensajeRepo;
    private usersService;
    constructor(chatRepo: Repository<Chat>, mensajeRepo: Repository<Mensaje>, usersService: UsersService);
    getOrCreateChat(usuarioAId: string, usuarioBId: string, inmuebleId?: string): Promise<Chat>;
    getChatById(id: string): Promise<Chat>;
    getChatsForUser(usuarioId: string): Promise<Chat[]>;
    getMessages(chatId: string): Promise<Mensaje[]>;
    sendMessage(data: {
        chatId: string;
        remitenteId: string;
        tipo?: TipoMensaje;
        contenido: string;
        archivoUrl?: string;
        ubicacion?: string;
    }): Promise<Mensaje>;
    markAsRead(chatId: string, currentUserId: string): Promise<{
        success: boolean;
    }>;
}
