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
exports.Contrato = exports.EstadoContrato = void 0;
const typeorm_1 = require("typeorm");
const inmueble_entity_1 = require("../../inmuebles/entities/inmueble.entity");
const tipo_contrato_entity_1 = require("./tipo-contrato.entity");
const usuario_entity_1 = require("../../usuarios/entities/usuario.entity");
const comision_entity_1 = require("./comision.entity");
var EstadoContrato;
(function (EstadoContrato) {
    EstadoContrato["BORRADOR"] = "borrador";
    EstadoContrato["ENVIADO"] = "enviado";
    EstadoContrato["ACEPTADO"] = "aceptado";
    EstadoContrato["RECHAZADO"] = "rechazado";
    EstadoContrato["ACTIVO"] = "activo";
    EstadoContrato["FINALIZADO"] = "finalizado";
    EstadoContrato["CANCELADO"] = "cancelado";
})(EstadoContrato || (exports.EstadoContrato = EstadoContrato = {}));
let Contrato = class Contrato {
};
exports.Contrato = Contrato;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Contrato.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Contrato.prototype, "inmuebleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inmueble_entity_1.Inmueble, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'inmuebleId' }),
    __metadata("design:type", inmueble_entity_1.Inmueble)
], Contrato.prototype, "inmueble", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Contrato.prototype, "tipoContratoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tipo_contrato_entity_1.TipoContrato),
    (0, typeorm_1.JoinColumn)({ name: 'tipoContratoId' }),
    __metadata("design:type", tipo_contrato_entity_1.TipoContrato)
], Contrato.prototype, "tipoContrato", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Contrato.prototype, "inquilinoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'inquilinoId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Contrato.prototype, "inquilino", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "chatId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Contrato.prototype, "inicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Contrato.prototype, "fin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Contrato.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'USD' }),
    __metadata("design:type", String)
], Contrato.prototype, "moneda", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Contrato.prototype, "deposito", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 5 }),
    __metadata("design:type", Number)
], Contrato.prototype, "diaPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Stripe' }),
    __metadata("design:type", String)
], Contrato.prototype, "formaPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "clausulas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "condicionesUso", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "penalidades", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "politicaCancelacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "incluyeServicios", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "restricciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "antecedentes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "usoExclusivo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "clausulasEspeciales", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EstadoContrato,
        default: EstadoContrato.BORRADOR,
    }),
    __metadata("design:type", String)
], Contrato.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "motivoRechazo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "firmaPropietario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Contrato.prototype, "fechaFirmaPropietario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "firmaInquilino", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Contrato.prototype, "fechaFirmaInquilino", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "blockchainTxId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Contrato.prototype, "blockchainHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Contrato.prototype, "blockchainBlockNumber", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => comision_entity_1.Comision, (c) => c.contrato),
    __metadata("design:type", Array)
], Contrato.prototype, "comisiones", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Contrato.prototype, "creado", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Contrato.prototype, "actualizado", void 0);
exports.Contrato = Contrato = __decorate([
    (0, typeorm_1.Entity)('contratos')
], Contrato);
//# sourceMappingURL=contrato.entity.js.map