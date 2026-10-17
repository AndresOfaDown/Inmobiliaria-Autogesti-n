import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { TipoMensaje } from './entities/mensaje.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private userSocketMap = new Map<string, string>(); // userId -> socketId

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Cliente WebSocket conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente WebSocket desconectado: ${client.id}`);
    for (const [userId, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        this.userSocketMap.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('register_user')
  handleRegisterUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (data?.userId) {
      this.userSocketMap.set(data.userId, client.id);
      this.logger.log(`Usuario registrado en WS: ${data.userId} -> Socket: ${client.id}`);
    }
  }

  @SubscribeMessage('join_chat')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    if (data?.chatId) {
      client.join(`chat_${data.chatId}`);
      this.logger.log(`Socket ${client.id} se unió a la sala chat_${data.chatId}`);
    }
  }

  @SubscribeMessage('leave_chat')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    if (data?.chatId) {
      client.leave(`chat_${data.chatId}`);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      chatId: string;
      remitenteId: string;
      tipo?: TipoMensaje;
      contenido: string;
      archivoUrl?: string;
      ubicacion?: string;
    },
  ) {
    try {
      const nuevoMensaje = await this.chatService.sendMessage(data);

      // Emitir a la sala de chat
      this.server.to(`chat_${data.chatId}`).emit('new_message', nuevoMensaje);

      // Emitir notificación global si el usuario receptor no está en la sala activa
      this.server.emit('global_chat_update', {
        chatId: data.chatId,
        message: nuevoMensaje,
      });

      return { success: true, message: nuevoMensaje };
    } catch (err) {
      client.emit('chat_error', { error: err.message });
      return { success: false, error: err.message };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; userId: string; isTyping: boolean },
  ) {
    client.to(`chat_${data.chatId}`).emit('user_typing', data);
  }
}
