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
exports.Hotspot = void 0;
const typeorm_1 = require("typeorm");
const inmueble_entity_1 = require("./inmueble.entity");
const multimedia_entity_1 = require("./multimedia.entity");
let Hotspot = class Hotspot {
};
exports.Hotspot = Hotspot;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Hotspot.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Hotspot.prototype, "inmuebleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inmueble_entity_1.Inmueble, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'inmuebleId' }),
    __metadata("design:type", inmueble_entity_1.Inmueble)
], Hotspot.prototype, "inmueble", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Hotspot.prototype, "escenaOrigenId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => multimedia_entity_1.Multimedia, (m) => m.hotspotsSalientes, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'escenaOrigenId' }),
    __metadata("design:type", multimedia_entity_1.Multimedia)
], Hotspot.prototype, "escenaOrigen", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Hotspot.prototype, "escenaDestinoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => multimedia_entity_1.Multimedia, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'escenaDestinoId' }),
    __metadata("design:type", multimedia_entity_1.Multimedia)
], Hotspot.prototype, "escenaDestino", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], Hotspot.prototype, "pitch", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 6, scale: 2 }),
    __metadata("design:type", Number)
], Hotspot.prototype, "yaw", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Hotspot.prototype, "textoAyuda", void 0);
exports.Hotspot = Hotspot = __decorate([
    (0, typeorm_1.Entity)('hotspots')
], Hotspot);
//# sourceMappingURL=hotspot.entity.js.map