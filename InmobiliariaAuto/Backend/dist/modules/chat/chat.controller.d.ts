import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getMyChats(user: any): Promise<import("./entities/chat.entity").Chat[]>;
    initiateChat(user: any, body: {
        targetUserId: string;
        inmuebleId?: string;
    }): Promise<import("./entities/chat.entity").Chat>;
    getMessages(id: string): Promise<import("./entities/mensaje.entity").Mensaje[]>;
    sendMessage(id: string, user: any, body: any): Promise<import("./entities/mensaje.entity").Mensaje>;
    markRead(id: string, user: any): Promise<{
        success: boolean;
    }>;
}
