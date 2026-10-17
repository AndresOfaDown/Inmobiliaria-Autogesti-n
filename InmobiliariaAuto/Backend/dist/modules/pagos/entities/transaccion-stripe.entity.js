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
exports.TransaccionStripe = exports.EstadoStripe = exports.TipoOperacionStripe = void 0;
const typeorm_1 = require("typeorm");
const contrato_entity_1 = require("../../contratos/entities/contrato.entity");
const usuario_entity_1 = require("../../usuarios/entities/usuario.entity");
var TipoOperacionStripe;
(function (TipoOperacionStripe) {
    TipoOperacionStripe["ALQUILER"] = "alquiler";
    TipoOperacionStripe["DEPOSITO"] = "deposito";
    TipoOperacionStripe["MENSUALIDAD"] = "mensualidad";
})(TipoOperacionStripe || (exports.TipoOperacionStripe = TipoOperacionStripe = {}));
var EstadoStripe;
(function (EstadoStripe) {
    EstadoStripe["PENDIENTE"] = "pendiente";
    EstadoStripe["COMPLETADA"] = "completada";
    EstadoStripe["FALLIDA"] = "fallida";
    EstadoStripe["REEMBOLSADA"] = "reembolsada";
})(EstadoStripe || (exports.EstadoStripe = EstadoStripe = {}));
let TransaccionStripe = class TransaccionStripe {
};
exports.TransaccionStripe = TransaccionStripe;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TransaccionStripe.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransaccionStripe.prototype, "contratoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => contrato_entity_1.Contrato, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'contratoId' }),
    __metadata("design:type", contrato_entity_1.Contrato)
], TransaccionStripe.prototype, "contrato", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransaccionStripe.prototype, "pagadorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'pagadorId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], TransaccionStripe.prototype, "pagador", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransaccionStripe.prototype, "propietarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'propietarioId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], TransaccionStripe.prototype, "propietario", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TipoOperacionStripe,
        default: TipoOperacionStripe.MENSUALIDAD,
    }),
    __metadata("design:type", String)
], TransaccionStripe.prototype, "tipoOperacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], TransaccionStripe.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'USD' }),
    __metadata("design:type", String)
], TransaccionStripe.prototype, "moneda", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TransaccionStripe.prototype, "stripeSessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TransaccionStripe.prototype, "stripePaymentIntent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EstadoStripe,
        default: EstadoStripe.PENDIENTE,
    }),
    __metadata("design:type", String)
], TransaccionStripe.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TransaccionStripe.prototype, "comprobanteUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TransaccionStripe.prototype, "blockchainTxId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TransaccionStripe.prototype, "creado", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TransaccionStripe.prototype, "actualizado", void 0);
exports.TransaccionStripe = TransaccionStripe = __decorate([
    (0, typeorm_1.Entity)('transacciones_stripe')
], TransaccionStripe);
//# sourceMappingURL=transaccion-stripe.entity.js.map