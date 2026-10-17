"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_entity_1 = require("./entities/chat.entity");
const mensaje_entity_1 = require("./entities/mensaje.entity");
const users_service_1 = require("../usuarios/users.service");
let ChatService = class ChatService {
    constructor(chatRepo, mensajeRepo, usersService) {
        this.chatRepo = chatRepo;
        this.mensajeRepo = mensajeRepo;
        this.usersService = usersService;
    }
    async getOrCreateChat(usuarioAId, usuarioBId, inmuebleId) {
        if (usuarioAId === usuarioBId) {
            throw new common_1.ForbiddenException('No puedes iniciar una conversación contigo mismo');
        }
        const isBlocked = await this.usersService.isBlocked(usuarioAId, usuarioBId);
        if (isBlocked) {
            throw new common_1.ForbiddenException('Existe un bloqueo activo entre los usuarios');
        }
        let chat = await this.chatRepo
            .createQueryBuilder('chat')
            .leftJoinAndSelect('chat.participante1', 'p1')
            .leftJoinAndSelect('chat.participante2', 'p2')
            .leftJoinAndSelect('chat.inmueble', 'inmueble')
            .where('((chat.participante1Id = :a AND chat.participante2Id = :b) OR (chat.participante1Id = :b AND chat.participante2Id = :a))', { a: usuarioAId, b: usuarioBId })
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
    async getChatById(id) {
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
        if (!chat)
            throw new common_1.NotFoundException('Conversación no encontrada');
        return chat;
    }
    async getChatsForUser(usuarioId) {
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
    async getMessages(chatId) {
        return this.mensajeRepo.find({
            where: { chatId },
            relations: ['remitente'],
            order: { creado: 'ASC' },
        });
    }
    async sendMessage(data) {
        const chat = await this.chatRepo.findOne({
            where: { id: data.chatId },
            relations: ['participante1', 'participante2'],
        });
        if (!chat)
            throw new common_1.NotFoundException('Chat no encontrado');
        const recipientId = chat.participante1Id === data.remitenteId
            ? chat.participante2Id
            : chat.participante1Id;
        const isBlocked = await this.usersService.isBlocked(data.remitenteId, recipientId);
        if (isBlocked) {
            throw new common_1.ForbiddenException('No se puede enviar el mensaje debido a un bloqueo de usuario');
        }
        const mensaje = this.mensajeRepo.create({
            chatId: data.chatId,
            remitenteId: data.remitenteId,
            tipo: data.tipo || mensaje_entity_1.TipoMensaje.TEXTO,
            contenido: data.contenido,
            archivoUrl: data.archivoUrl,
            ubicacion: data.ubicacion,
            leido: false,
        });
        const saved = await this.mensajeRepo.save(mensaje);
        chat.actualizado = new Date();
        await this.chatRepo.save(chat);
        return this.mensajeRepo.findOne({
            where: { id: saved.id },
            relations: ['remitente'],
        });
    }
    async markAsRead(chatId, currentUserId) {
        await this.mensajeRepo
            .createQueryBuilder()
            .update(mensaje_entity_1.Mensaje)
            .set({ leido: true })
            .where('chatId = :chatId AND remitenteId != :currentUserId', {
            chatId,
            currentUserId,
        })
            .execute();
        return { success: true };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_entity_1.Chat)),
    __param(1, (0, typeorm_1.InjectRepository)(mensaje_entity_1.Mensaje)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], ChatService);
//# sourceMappingURL=chat.service.js.map