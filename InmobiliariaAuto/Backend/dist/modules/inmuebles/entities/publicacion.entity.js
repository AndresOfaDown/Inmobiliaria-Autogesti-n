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
exports.Publicacion = exports.EstadoPublicacion = exports.TipoOferta = void 0;
const typeorm_1 = require("typeorm");
const inmueble_entity_1 = require("./inmueble.entity");
var TipoOferta;
(function (TipoOferta) {
    TipoOferta["ALQUILER"] = "alquiler";
    TipoOferta["VENTA"] = "venta";
    TipoOferta["ANTICRETICO"] = "anticretico";
})(TipoOferta || (exports.TipoOferta = TipoOferta = {}));
var EstadoPublicacion;
(function (EstadoPublicacion) {
    EstadoPublicacion["BORRADOR"] = "borrador";
    EstadoPublicacion["ACTIVA"] = "activa";
    EstadoPublicacion["PAUSADA"] = "pausada";
    EstadoPublicacion["FINALIZADA"] = "finalizada";
})(EstadoPublicacion || (exports.EstadoPublicacion = EstadoPublicacion = {}));
let Publicacion = class Publicacion {
};
exports.Publicacion = Publicacion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Publicacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Publicacion.prototype, "inmuebleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inmueble_entity_1.Inmueble, (i) => i.publicaciones, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'inmuebleId' }),
    __metadata("design:type", inmueble_entity_1.Inmueble)
], Publicacion.prototype, "inmueble", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TipoOferta,
        default: TipoOferta.ALQUILER,
    }),
    __metadata("design:type", String)
], Publicacion.prototype, "tipoOferta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Publicacion.prototype, "precio", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'USD' }),
    __metadata("design:type", String)
], Publicacion.prototype, "moneda", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EstadoPublicacion,
        default: EstadoPublicacion.ACTIVA,
    }),
    __metadata("design:type", String)
], Publicacion.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Publicacion.prototype, "creado", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Publicacion.prototype, "actualizado", void 0);
exports.Publicacion = Publicacion = __decorate([
    (0, typeorm_1.Entity)('publicaciones')
], Publicacion);
//# sourceMappingURL=publicacion.entity.js.map