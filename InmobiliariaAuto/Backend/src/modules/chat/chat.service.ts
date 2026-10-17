import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Chat } from './entities/chat.entity';
import { Mensaje, TipoMensaje } from './entities/mensaje.entity';
import { UsersService } from '../usuarios/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepo: Repository<Chat>,
    @InjectRepository(Mensaje)
    private mensajeRepo: Repository<Mensaje>,
    private usersService: UsersService,
  ) {}

  async getOrCreateChat(
    usuarioAId: string,
    usuarioBId: string,
    inmuebleId?: string,
  ) {
    if (usuarioAId === usuarioBId) {
      throw new ForbiddenException('No puedes iniciar una conversación contigo mismo');
    }

    const isBlocked = await this.usersService.isBlocked(usuarioAId, usuarioBId);
    if (isBlocked) {
      throw new ForbiddenException('Existe un bloqueo activo entre los usuarios');
    }

    // Buscar si ya existe chat entre ambos
    let chat = await this.chatRepo
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participante1', 'p1')
      .leftJoinAndSelect('chat.participante2', 'p2')
      .leftJoinAndSelect('chat.inmueble', 'inmueble')
      .where(
        '((chat.participante1Id = :a AND chat.participante2Id = :b) OR (chat.participante1Id = :b AND chat.participante2Id = :a))',
        { a: usuarioAId, b: usuarioBId },
      )
      .getOne();

    if (!chat) {
      chat = this.chatRepo.create({
        participante1Id: usuarioAId,
        participante2Id: usuarioBId,
        inmuebleId,
      });
      chat = await this.chatRepo.save(chat);
      return this.getChatById(chat.id);
    }

    return chat;
  }

  async getChatById(id: string) {
    const chat = await this.chatRepo.findOne({
      where: { id },
      relations: [
        'participante1',
        'participante2',
        'inmueble',
        'inmueble.multimedia',
        'mensajes',
        'mensajes.remitente',
      ],
    });
    if (!chat) throw new NotFoundException('Conversación no encontrada');
    return chat;
  }

  async getChatsForUser(usuarioId: string) {
    return this.chatRepo
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participante1', 'p1')
      .leftJoinAndSelect('chat.participante2', 'p2')
      .leftJoinAndSelect('chat.inmueble', 'inmueble')
      .leftJoinAndSelect('chat.mensajes', 'mensajes')
      .where('chat.participante1Id = :id OR chat.participante2Id = :id', {
        id: usuarioId,
      })
      .orderBy('chat.actualizado', 'DESC')
      .getMany();
  }

  async getMessages(chatId: string) {
    return this.mensajeRepo.find({
      where: { chatId },
      relations: ['remitente'],
      order: { creado: 'ASC' },
    });
  }

  async sendMessage(data: {
    chatId: string;
    remitenteId: string;
    tipo?: TipoMensaje;
    contenido: string;
    archivoUrl?: string;
    ubicacion?: string;
  }) {
    const chat = await this.chatRepo.findOne({
      where: { id: data.chatId },
      relations: ['participante1', 'participante2'],
    });
    if (!chat) throw new NotFoundException('Chat no encontrado');

    const recipientId =
      chat.participante1Id === data.remitenteId
        ? chat.participante2Id
        : chat.participante1Id;

    const isBlocked = await this.usersService.isBlocked(data.remitenteId, recipientId);
    if (isBlocked) {
      throw new ForbiddenException('No se puede enviar el mensaje debido a un bloqueo de usuario');
    }

    const mensaje = this.mensajeRepo.create({
      chatId: data.chatId,
      remitenteId: data.remitenteId,
      tipo: data.tipo || TipoMensaje.TEXTO,
      contenido: data.contenido,
      archivoUrl: data.archivoUrl,
      ubicacion: data.ubicacion,
      leido: false,
    });

    const saved = await this.mensajeRepo.save(mensaje);

    // Actualizar timestamp del chat
    chat.actualizado = new Date();
    await this.chatRepo.save(chat);

    return this.mensajeRepo.findOne({
      where: { id: saved.id },
      relations: ['remitente'],
    });
  }

  async markAsRead(chatId: string, currentUserId: string) {
    await this.mensajeRepo
      .createQueryBuilder()
      .update(Mensaje)
      .set({ leido: true })
      .where('chatId = :chatId AND remitenteId != :currentUserId', {
        chatId,
        currentUserId,
      })
      .execute();

    return { success: true };
  }
}
