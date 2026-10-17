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
exports.HistorialPago = void 0;
const typeorm_1 = require("typeorm");
const pago_entity_1 = require("./pago.entity");
const pago_enum_1 = require("./pago.enum");
const usuario_entity_1 = require("../../usuarios/entities/usuario.entity");
let HistorialPago = class HistorialPago {
};
exports.HistorialPago = HistorialPago;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], HistorialPago.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], HistorialPago.prototype, "pagoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pago_entity_1.Pago, (p) => p.historial, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'pagoId' }),
    __metadata("design:type", pago_entity_1.Pago)
], HistorialPago.prototype, "pago", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: pago_enum_1.EstadoPago,
        nullable: true,
    }),
    __metadata("design:type", String)
], HistorialPago.prototype, "estadoAnterior", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: pago_enum_1.EstadoPago,
    }),
    __metadata("design:type", String)
], HistorialPago.prototype, "estadoNuevo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], HistorialPago.prototype, "comentario", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HistorialPago.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'usuarioId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], HistorialPago.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], HistorialPago.prototype, "fecha", void 0);
exports.HistorialPago = HistorialPago = __decorate([
    (0, typeorm_1.Entity)('historial_pagos')
], HistorialPago);
//# sourceMappingURL=historial-pago.entity.js.map