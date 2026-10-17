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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mensaje = exports.TipoMensaje = void 0;
const typeorm_1 = require("typeorm");
const chat_entity_1 = require("./chat.entity");
const usuario_entity_1 = require("../../usuarios/entities/usuario.entity");
var TipoMensaje;
(function (TipoMensaje) {
    TipoMensaje["TEXTO"] = "texto";
    TipoMensaje["IMAGEN"] = "imagen";
    TipoMensaje["VIDEO"] = "video";
    TipoMensaje["UBICACION"] = "ubicacion";
    TipoMensaje["RECORRIDO360"] = "recorrido360";
    TipoMensaje["WHATSAPP"] = "whatsapp";
})(TipoMensaje || (exports.TipoMensaje = TipoMensaje = {}));
let Mensaje = class Mensaje {
};
exports.Mensaje = Mensaje;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Mensaje.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Mensaje.prototype, "chatId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chat_entity_1.Chat, (c) => c.mensajes, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'chatId' }),
    __metadata("design:type", chat_entity_1.Chat)
], Mensaje.prototype, "chat", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Mensaje.prototype, "remitenteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'remitenteId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Mensaje.prototype, "remitente", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TipoMensaje,
        default: TipoMensaje.TEXTO,
    }),
    __metadata("design:type", String)
], Mensaje.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Mensaje.prototype, "contenido", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Mensaje.prototype, "archivoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Mensaje.prototype, "ubicacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Mensaje.prototype, "leido", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Mensaje.prototype, "creado", void 0);
exports.Mensaje = Mensaje = __decorate([
    (0, typeorm_1.Entity)('mensajes')
], Mensaje);
//# sourceMappingURL=mensaje.entity.js.map