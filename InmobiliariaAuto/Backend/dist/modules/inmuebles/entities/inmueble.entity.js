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
exports.Inmueble = exports.EstadoInmueble = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_1 = require("../../usuarios/entities/usuario.entity");
const tipo_inmueble_entity_1 = require("./tipo-inmueble.entity");
const direccion_entity_1 = require("./direccion.entity");
const multimedia_entity_1 = require("./multimedia.entity");
const publicacion_entity_1 = require("./publicacion.entity");
var EstadoInmueble;
(function (EstadoInmueble) {
    EstadoInmueble["DISPONIBLE"] = "disponible";
    EstadoInmueble["OCUPADO"] = "ocupado";
    EstadoInmueble["MANTENIMIENTO"] = "mantenimiento";
    EstadoInmueble["RESERVADO"] = "reservado";
    EstadoInmueble["OCULTO"] = "oculto";
})(EstadoInmueble || (exports.EstadoInmueble = EstadoInmueble = {}));
let Inmueble = class Inmueble {
};
exports.Inmueble = Inmueble;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Inmueble.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Inmueble.prototype, "propietarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'propietarioId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Inmueble.prototype, "propietario", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Inmueble.prototype, "tipoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tipo_inmueble_entity_1.TipoInmueble),
    (0, typeorm_1.JoinColumn)({ name: 'tipoId' }),
    __metadata("design:type", tipo_inmueble_entity_1.TipoInmueble)
], Inmueble.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Inmueble.prototype, "direccionId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => direccion_entity_1.Direccion, { cascade: true, eager: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'direccionId' }),
    __metadata("design:type", direccion_entity_1.Direccion)
], Inmueble.prototype, "direccion", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Inmueble.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Inmueble.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Inmueble.prototype, "largo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Inmueble.prototype, "ancho", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 8, scale: 2 }),
    __metadata("design:type", Number)
], Inmueble.prototype, "superficie", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Inmueble.prototype, "habitaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Inmueble.prototype, "banos", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Inmueble.prototype, "garaje", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EstadoInmueble,
        default: EstadoInmueble.DISPONIBLE,
    }),
    __metadata("design:type", String)
], Inmueble.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Inmueble.prototype, "gps", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Inmueble.prototype, "modelo3dUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Inmueble.prototype, "valorActivo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Inmueble.prototype, "hashBlockchain", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => multimedia_entity_1.Multimedia, (m) => m.inmueble, { cascade: true }),
    __metadata("design:type", Array)
], Inmueble.prototype, "multimedia", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => publicacion_entity_1.Publicacion, (p) => p.inmueble),
    __metadata("design:type", Array)
], Inmueble.prototype, "publicaciones", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Inmueble.prototype, "creado", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Inmueble.prototype, "actualizado", void 0);
exports.Inmueble = Inmueble = __decorate([
    (0, typeorm_1.Entity)('inmuebles')
], Inmueble);
//# sourceMappingURL=inmueble.entity.js.map