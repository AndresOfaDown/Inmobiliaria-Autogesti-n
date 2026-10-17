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
exports.Notificacion = exports.OrigenNotificacion = exports.TipoNotificacion = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_1 = require("./usuario.entity");
var TipoNotificacion;
(function (TipoNotificacion) {
    TipoNotificacion["INFO"] = "info";
    TipoNotificacion["ALERTA"] = "alerta";
    TipoNotificacion["RECORDATORIO"] = "recordatorio";
    TipoNotificacion["PAGO"] = "pago";
    TipoNotificacion["CONFIRMACION"] = "confirmacion";
})(TipoNotificacion || (exports.TipoNotificacion = TipoNotificacion = {}));
var OrigenNotificacion;
(function (OrigenNotificacion) {
    OrigenNotificacion["SISTEMA"] = "sistema";
    OrigenNotificacion["USUARIO"] = "usuario";
})(OrigenNotificacion || (exports.OrigenNotificacion = OrigenNotificacion = {}));
let Notificacion = class Notificacion {
};
exports.Notificacion = Notificacion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Notificacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Notificacion.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'usuarioId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Notificacion.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TipoNotificacion,
        default: TipoNotificacion.INFO,
    }),
    __metadata("design:type", String)
], Notificacion.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: OrigenNotificacion,
        default: OrigenNotificacion.SISTEMA,
    }),
    __metadata("design:type", String)
], Notificacion.prototype, "origen", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Notificacion.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Notificacion.prototype, "mensaje", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Notificacion.prototype, "leida", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Notificacion.prototype, "creado", void 0);
exports.Notificacion = Notificacion = __decorate([
    (0, typeorm_1.Entity)('notificaciones')
], Notificacion);
//# sourceMappingURL=notificacion.entity.js.map