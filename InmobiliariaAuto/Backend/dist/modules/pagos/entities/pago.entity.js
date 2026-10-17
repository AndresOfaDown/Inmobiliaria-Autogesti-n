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
exports.Pago = exports.EstadoPago = void 0;
const typeorm_1 = require("typeorm");
const contrato_entity_1 = require("../../contratos/entities/contrato.entity");
const tipo_pago_entity_1 = require("./tipo-pago.entity");
const usuario_entity_1 = require("../../usuarios/entities/usuario.entity");
const detalle_pago_entity_1 = require("./detalle-pago.entity");
const historial_pago_entity_1 = require("./historial-pago.entity");
const pago_enum_1 = require("./pago.enum");
Object.defineProperty(exports, "EstadoPago", { enumerable: true, get: function () { return pago_enum_1.EstadoPago; } });
let Pago = class Pago {
};
exports.Pago = Pago;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Pago.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Pago.prototype, "contratoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => contrato_entity_1.Contrato, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'contratoId' }),
    __metadata("design:type", contrato_entity_1.Contrato)
], Pago.prototype, "contrato", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pago.prototype, "tipoPagoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tipo_pago_entity_1.TipoPago, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'tipoPagoId' }),
    __metadata("design:type", tipo_pago_entity_1.TipoPago)
], Pago.prototype, "tipoPago", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Pago.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'usuarioId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Pago.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Pago.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Pago.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pago.prototype, "referencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pago.prototype, "comprobanteUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: pago_enum_1.EstadoPago,
        default: pago_enum_1.EstadoPago.PENDIENTE,
    }),
    __metadata("design:type", String)
], Pago.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Pago.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Pago.prototype, "blockchainTxId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => detalle_pago_entity_1.DetallePago, (d) => d.pago, { cascade: true }),
    __metadata("design:type", Array)
], Pago.prototype, "detalles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => historial_pago_entity_1.HistorialPago, (h) => h.pago, { cascade: true }),
    __metadata("design:type", Array)
], Pago.prototype, "historial", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Pago.prototype, "creado", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Pago.prototype, "actualizado", void 0);
exports.Pago = Pago = __decorate([
    (0, typeorm_1.Entity)('pagos')
], Pago);
//# sourceMappingURL=pago.entity.js.map