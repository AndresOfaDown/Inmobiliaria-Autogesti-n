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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const usuario_entity_1 = require("./entities/usuario.entity");
const agenda_entity_1 = require("./entities/agenda.entity");
const notificacion_entity_1 = require("./entities/notificacion.entity");
const resena_entity_1 = require("./entities/resena.entity");
const bloqueo_entity_1 = require("./entities/bloqueo.entity");
let UsersService = class UsersService {
    constructor(usersRepo, agendaRepo, notifRepo, resenaRepo, bloqueoRepo) {
        this.usersRepo = usersRepo;
        this.agendaRepo = agendaRepo;
        this.notifRepo = notifRepo;
        this.resenaRepo = resenaRepo;
        this.bloqueoRepo = bloqueoRepo;
    }
    async findAll() {
        const users = await this.usersRepo.find({
            select: ['id', 'email', 'rol', 'nombre', 'apellido', 'telefono', 'ci', 'direccion', 'activo', 'creado'],
            order: { creado: 'DESC' },
        });
        return users;
    }
    async findById(id) {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const { password, ...result } = user;
        return result;
    }
    async updateProfile(id, data) {
        await this.usersRepo.update(id, data);
        return this.findById(id);
    }
    async toggleActive(id) {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        user.activo = !user.activo;
        await this.usersRepo.save(user);
        return { id: user.id, activo: user.activo };
    }
    async getNotifications(usuarioId) {
        return this.notifRepo.find({
            where: { usuarioId },
            order: { creado: 'DESC' },
            take: 50,
        });
    }
    async createNotification(usuarioId, titulo, mensaje, tipo = notificacion_entity_1.TipoNotificacion.INFO, origen = notificacion_entity_1.OrigenNotificacion.SISTEMA) {
        const notif = this.notifRepo.create({
            usuarioId,
            titulo,
            mensaje,
            tipo,
            origen,
            leida: false,
        });
        return this.notifRepo.save(notif);
    }
    async markNotificationAsRead(id) {
        await this.notifRepo.update(id, { leida: true });
        return { success: true };
    }
    async getAgenda(usuarioId) {
        return this.agendaRepo.find({
            where: { usuarioId },
            order: { inicio: 'ASC' },
        });
    }
    async createAgendaItem(usuarioId, data) {
        const item = this.agendaRepo.create({ ...data, usuarioId });
        return this.agendaRepo.save(item);
    }
    async getReviewsForInmueble(inmuebleId) {
        return this.resenaRepo.find({
            where: { inmuebleId },
            relations: ['usuario'],
            order: { creado: 'DESC' },
        });
    }
    async addReview(usuarioId, inmuebleId, calificacion, comentario) {
        const resena = this.resenaRepo.create({
            usuarioId,
            inmuebleId,
            calificacion,
            comentario,
        });
        return this.resenaRepo.save(resena);
    }
    async blockUser(bloqueadorId, bloqueadoId) {
        const bloqueo = this.bloqueoRepo.create({ bloqueadorId, bloqueadoId });
        return this.bloqueoRepo.save(bloqueo);
    }
    async unblockUser(bloqueadorId, bloqueadoId) {
        await this.bloqueoRepo.delete({ bloqueadorId, bloqueadoId });
        return { success: true };
    }
    async isBlocked(userA, userB) {
        const found = await this.bloqueoRepo.findOne({
            where: [
                { bloqueadorId: userA, bloqueadoId: userB },
                { bloqueadorId: userB, bloqueadoId: userA },
            ],
        });
        return !!found;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __param(1, (0, typeorm_1.InjectRepository)(agenda_entity_1.Agenda)),
    __param(2, (0, typeorm_1.InjectRepository)(notificacion_entity_1.Notificacion)),
    __param(3, (0, typeorm_1.InjectRepository)(resena_entity_1.Resena)),
    __param(4, (0, typeorm_1.InjectRepository)(bloqueo_entity_1.Bloqueo)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map