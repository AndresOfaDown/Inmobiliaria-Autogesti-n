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
exports.AccesoRecorrido360 = void 0;
const typeorm_1 = require("typeorm");
const inmueble_entity_1 = require("./inmueble.entity");
const usuario_entity_1 = require("../../usuarios/entities/usuario.entity");
let AccesoRecorrido360 = class AccesoRecorrido360 {
};
exports.AccesoRecorrido360 = AccesoRecorrido360;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AccesoRecorrido360.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AccesoRecorrido360.prototype, "inmuebleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inmueble_entity_1.Inmueble, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'inmuebleId' }),
    __metadata("design:type", inmueble_entity_1.Inmueble)
], AccesoRecorrido360.prototype, "inmueble", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AccesoRecorrido360.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'clienteId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], AccesoRecorrido360.prototype, "cliente", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AccesoRecorrido360.prototype, "propietarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'propietarioId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], AccesoRecorrido360.prototype, "propietario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], AccesoRecorrido360.prototype, "fechaExpiracion", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], AccesoRecorrido360.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], AccesoRecorrido360.prototype, "visitas", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AccesoRecorrido360.prototype, "creado", void 0);
exports.AccesoRecorrido360 = AccesoRecorrido360 = __decorate([
    (0, typeorm_1.Entity)('accesos_recorrido_360')
], AccesoRecorrido360);
//# sourceMappingURL=acceso-recorrido.entity.js.map