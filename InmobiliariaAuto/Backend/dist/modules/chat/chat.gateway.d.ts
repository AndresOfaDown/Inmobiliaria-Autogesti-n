import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { TipoMensaje } from './entities/mensaje.entity';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    server: Server;
    private readonly logger;
    private userSocketMap;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleRegisterUser(client: Socket, data: {
        userId: string;
    }): void;
    handleJoinChat(client: Socket, data: {
        chatId: string;
    }): void;
    handleLeaveChat(client: Socket, data: {
        chatId: string;
    }): void;
    handleSendMessage(client: Socket, data: {
        chatId: string;
        remitenteId: string;
        tipo?: TipoMensaje;
        contenido: string;
        archivoUrl?: string;
        ubicacion?: string;
    }): Promise<{
        success: boolean;
        message: import("./entities/mensaje.entity").Mensaje;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    handleTyping(client: Socket, data: {
        chatId: string;
        userId: string;
        isTyping: boolean;
    }): void;
}
