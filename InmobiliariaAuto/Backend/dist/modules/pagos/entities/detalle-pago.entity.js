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
exports.DetallePago = void 0;
const typeorm_1 = require("typeorm");
const pago_entity_1 = require("./pago.entity");
let DetallePago = class DetallePago {
};
exports.DetallePago = DetallePago;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DetallePago.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DetallePago.prototype, "pagoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pago_entity_1.Pago, (p) => p.detalles, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'pagoId' }),
    __metadata("design:type", pago_entity_1.Pago)
], DetallePago.prototype, "pago", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DetallePago.prototype, "concepto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], DetallePago.prototype, "monto", void 0);
exports.DetallePago = DetallePago = __decorate([
    (0, typeorm_1.Entity)('detalles_pago')
], DetallePago);
//# sourceMappingURL=detalle-pago.entity.js.map