"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const pago_entity_1 = require("./entities/pago.entity");
const tipo_pago_entity_1 = require("./entities/tipo-pago.entity");
const detalle_pago_entity_1 = require("./entities/detalle-pago.entity");
const historial_pago_entity_1 = require("./entities/historial-pago.entity");
const transaccion_stripe_entity_1 = require("./entities/transaccion-stripe.entity");
const configuracion_sistema_entity_1 = require("./entities/configuracion-sistema.entity");
const contrato_entity_1 = require("../contratos/entities/contrato.entity");
const comision_entity_1 = require("../contratos/entities/comision.entity");
const payments_service_1 = require("./payments.service");
const payments_controller_1 = require("./payments.controller");
const users_module_1 = require("../usuarios/users.module");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                pago_entity_1.Pago,
                tipo_pago_entity_1.TipoPago,
                detalle_pago_entity_1.DetallePago,
                historial_pago_entity_1.HistorialPago,
                transaccion_stripe_entity_1.TransaccionStripe,
                configuracion_sistema_entity_1.ConfiguracionSistema,
                contrato_entity_1.Contrato,
                comision_entity_1.Comision,
            ]),
            config_1.ConfigModule,
            users_module_1.UsersModule,
        ],
        providers: [payments_service_1.PaymentsService],
        controllers: [payments_controller_1.PaymentsController],
        exports: [payments_service_1.PaymentsService, typeorm_1.TypeOrmModule],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map