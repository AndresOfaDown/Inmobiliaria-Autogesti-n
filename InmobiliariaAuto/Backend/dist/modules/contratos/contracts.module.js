"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const contrato_entity_1 = require("./entities/contrato.entity");
const tipo_contrato_entity_1 = require("./entities/tipo-contrato.entity");
const comision_entity_1 = require("./entities/comision.entity");
const inmueble_entity_1 = require("../inmuebles/entities/inmueble.entity");
const contracts_service_1 = require("./contracts.service");
const contracts_controller_1 = require("./contracts.controller");
const users_module_1 = require("../usuarios/users.module");
let ContractsModule = class ContractsModule {
};
exports.ContractsModule = ContractsModule;
exports.ContractsModule = ContractsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([contrato_entity_1.Contrato, tipo_contrato_entity_1.TipoContrato, comision_entity_1.Comision, inmueble_entity_1.Inmueble]),
            users_module_1.UsersModule,
        ],
        providers: [contracts_service_1.ContractsService],
        controllers: [contracts_controller_1.ContractsController],
        exports: [contracts_service_1.ContractsService, typeorm_1.TypeOrmModule],
    })
], ContractsModule);
//# sourceMappingURL=contracts.module.js.map