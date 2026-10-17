"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const seed_service_1 = require("./seed.service");
const usuario_entity_1 = require("../usuarios/entities/usuario.entity");
const tipo_inmueble_entity_1 = require("../inmuebles/entities/tipo-inmueble.entity");
const tipo_contrato_entity_1 = require("../contratos/entities/tipo-contrato.entity");
const tipo_pago_entity_1 = require("../pagos/entities/tipo-pago.entity");
const configuracion_sistema_entity_1 = require("../pagos/entities/configuracion-sistema.entity");
const properties_module_1 = require("../inmuebles/properties.module");
const contracts_module_1 = require("../contratos/contracts.module");
const payments_module_1 = require("../pagos/payments.module");
let SeedModule = class SeedModule {
};
exports.SeedModule = SeedModule;
exports.SeedModule = SeedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                usuario_entity_1.Usuario,
                tipo_inmueble_entity_1.TipoInmueble,
                tipo_contrato_entity_1.TipoContrato,
                tipo_pago_entity_1.TipoPago,
                configuracion_sistema_entity_1.ConfiguracionSistema,
            ]),
            properties_module_1.PropertiesModule,
            contracts_module_1.ContractsModule,
            payments_module_1.PaymentsModule,
        ],
        providers: [seed_service_1.SeedService],
    })
], SeedModule);
//# sourceMappingURL=seed.module.js.map