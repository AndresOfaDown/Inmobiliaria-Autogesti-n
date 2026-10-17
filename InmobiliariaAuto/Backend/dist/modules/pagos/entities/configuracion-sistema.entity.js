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
exports.ConfiguracionSistema = void 0;
const typeorm_1 = require("typeorm");
let ConfiguracionSistema = class ConfiguracionSistema {
};
exports.ConfiguracionSistema = ConfiguracionSistema;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConfiguracionSistema.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 5.00 }),
    __metadata("design:type", Number)
], ConfiguracionSistema.prototype, "porcentajeComisionPlataforma", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ConfiguracionSistema.prototype, "actualizado", void 0);
exports.ConfiguracionSistema = ConfiguracionSistema = __decorate([
    (0, typeorm_1.Entity)('configuracion_sistema')
], ConfiguracionSistema);
//# sourceMappingURL=configuracion-sistema.entity.js.map