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
exports.Favorito = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_1 = require("../../usuarios/entities/usuario.entity");
const inmueble_entity_1 = require("./inmueble.entity");
let Favorito = class Favorito {
};
exports.Favorito = Favorito;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Favorito.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Favorito.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'usuarioId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Favorito.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Favorito.prototype, "inmuebleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inmueble_entity_1.Inmueble, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'inmuebleId' }),
    __metadata("design:type", inmueble_entity_1.Inmueble)
], Favorito.prototype, "inmueble", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Favorito.prototype, "creado", void 0);
exports.Favorito = Favorito = __decorate([
    (0, typeorm_1.Entity)('favoritos'),
    (0, typeorm_1.Unique)(['usuarioId', 'inmuebleId'])
], Favorito);
//# sourceMappingURL=favorito.entity.js.map