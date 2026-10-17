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
exports.Multimedia = exports.TipoMultimedia = void 0;
const typeorm_1 = require("typeorm");
const inmueble_entity_1 = require("./inmueble.entity");
const hotspot_entity_1 = require("./hotspot.entity");
var TipoMultimedia;
(function (TipoMultimedia) {
    TipoMultimedia["IMAGEN"] = "imagen";
    TipoMultimedia["VIDEO"] = "video";
    TipoMultimedia["PANORAMA360"] = "panorama360";
    TipoMultimedia["MUSICA"] = "musica";
})(TipoMultimedia || (exports.TipoMultimedia = TipoMultimedia = {}));
let Multimedia = class Multimedia {
};
exports.Multimedia = Multimedia;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Multimedia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Multimedia.prototype, "inmuebleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inmueble_entity_1.Inmueble, (i) => i.multimedia, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'inmuebleId' }),
    __metadata("design:type", inmueble_entity_1.Inmueble)
], Multimedia.prototype, "inmueble", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TipoMultimedia,
        default: TipoMultimedia.IMAGEN,
    }),
    __metadata("design:type", String)
], Multimedia.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Multimedia.prototype, "archivoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Multimedia.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Multimedia.prototype, "principal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Multimedia.prototype, "orden", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => hotspot_entity_1.Hotspot, (h) => h.escenaOrigen),
    __metadata("design:type", Array)
], Multimedia.prototype, "hotspotsSalientes", void 0);
exports.Multimedia = Multimedia = __decorate([
    (0, typeorm_1.Entity)('multimedia')
], Multimedia);
//# sourceMappingURL=multimedia.entity.js.map