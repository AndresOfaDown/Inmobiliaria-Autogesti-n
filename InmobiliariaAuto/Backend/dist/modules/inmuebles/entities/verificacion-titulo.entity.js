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
exports.VerificacionTitulo = exports.EstadoVerificacion = void 0;
const typeorm_1 = require("typeorm");
const inmueble_entity_1 = require("./inmueble.entity");
const usuario_entity_1 = require("../../usuarios/entities/usuario.entity");
var EstadoVerificacion;
(function (EstadoVerificacion) {
    EstadoVerificacion["PENDIENTE"] = "pendiente";
    EstadoVerificacion["PROCESANDO"] = "procesando";
    EstadoVerificacion["VERIFICADO"] = "verificado";
    EstadoVerificacion["OBSERVADO"] = "observado";
    EstadoVerificacion["RECHAZADO"] = "rechazado";
})(EstadoVerificacion || (exports.EstadoVerificacion = EstadoVerificacion = {}));
let VerificacionTitulo = class VerificacionTitulo {
};
exports.VerificacionTitulo = VerificacionTitulo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VerificacionTitulo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VerificacionTitulo.prototype, "inmuebleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inmueble_entity_1.Inmueble, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'inmuebleId' }),
    __metadata("design:type", inmueble_entity_1.Inmueble)
], VerificacionTitulo.prototype, "inmueble", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VerificacionTitulo.prototype, "solicitadoPorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'solicitadoPorId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], VerificacionTitulo.prototype, "solicitadoPor", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VerificacionTitulo.prototype, "archivoTituloUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], VerificacionTitulo.prototype, "textoOcr", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], VerificacionTitulo.prototype, "resultadoIa", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EstadoVerificacion,
        default: EstadoVerificacion.PENDIENTE,
    }),
    __metadata("design:type", String)
], VerificacionTitulo.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], VerificacionTitulo.prototype, "scoreConfianza", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], VerificacionTitulo.prototype, "resumenPublico", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], VerificacionTitulo.prototype, "hashCertificado", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VerificacionTitulo.prototype, "creado", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VerificacionTitulo.prototype, "actualizado", void 0);
exports.VerificacionTitulo = VerificacionTitulo = __decorate([
    (0, typeorm_1.Entity)('verificaciones_titulo')
], VerificacionTitulo);
//# sourceMappingURL=verificacion-titulo.entity.js.map