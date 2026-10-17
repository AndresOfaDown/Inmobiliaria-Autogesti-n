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
exports.Cita = exports.EstadoCita = void 0;
const typeorm_1 = require("typeorm");
const inmueble_entity_1 = require("./inmueble.entity");
const usuario_entity_1 = require("../../usuarios/entities/usuario.entity");
var EstadoCita;
(function (EstadoCita) {
    EstadoCita["PENDIENTE"] = "pendiente";
    EstadoCita["CONFIRMADA"] = "confirmada";
    EstadoCita["CANCELADA"] = "cancelada";
    EstadoCita["COMPLETADA"] = "completada";
})(EstadoCita || (exports.EstadoCita = EstadoCita = {}));
let Cita = class Cita {
};
exports.Cita = Cita;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Cita.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Cita.prototype, "inmuebleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inmueble_entity_1.Inmueble, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'inmuebleId' }),
    __metadata("design:type", inmueble_entity_1.Inmueble)
], Cita.prototype, "inmueble", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Cita.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'clienteId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Cita.prototype, "cliente", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Cita.prototype, "propietarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'propietarioId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Cita.prototype, "propietario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Cita.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Cita.prototype, "horaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Cita.prototype, "horaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EstadoCita,
        default: EstadoCita.PENDIENTE,
    }),
    __metadata("design:type", String)
], Cita.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Cita.prototype, "notas", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Cita.prototype, "creado", void 0);
exports.Cita = Cita = __decorate([
    (0, typeorm_1.Entity)('citas')
], Cita);
//# sourceMappingURL=cita.entity.js.map