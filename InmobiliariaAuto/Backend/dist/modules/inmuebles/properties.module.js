"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const inmueble_entity_1 = require("./entities/inmueble.entity");
const tipo_inmueble_entity_1 = require("./entities/tipo-inmueble.entity");
const direccion_entity_1 = require("./entities/direccion.entity");
const multimedia_entity_1 = require("./entities/multimedia.entity");
const hotspot_entity_1 = require("./entities/hotspot.entity");
const publicacion_entity_1 = require("./entities/publicacion.entity");
const cita_entity_1 = require("./entities/cita.entity");
const horario_disponible_entity_1 = require("./entities/horario-disponible.entity");
const verificacion_titulo_entity_1 = require("./entities/verificacion-titulo.entity");
const acceso_recorrido_entity_1 = require("./entities/acceso-recorrido.entity");
const favorito_entity_1 = require("./entities/favorito.entity");
const properties_service_1 = require("./properties.service");
const properties_controller_1 = require("./properties.controller");
const ai_module_1 = require("../ia/ai.module");
let PropertiesModule = class PropertiesModule {
};
exports.PropertiesModule = PropertiesModule;
exports.PropertiesModule = PropertiesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                inmueble_entity_1.Inmueble,
                tipo_inmueble_entity_1.TipoInmueble,
                direccion_entity_1.Direccion,
                multimedia_entity_1.Multimedia,
                hotspot_entity_1.Hotspot,
                publicacion_entity_1.Publicacion,
                cita_entity_1.Cita,
                horario_disponible_entity_1.HorarioDisponible,
                verificacion_titulo_entity_1.VerificacionTitulo,
                acceso_recorrido_entity_1.AccesoRecorrido360,
                favorito_entity_1.Favorito,
            ]),
            ai_module_1.AiModule,
        ],
        providers: [properties_service_1.PropertiesService],
        controllers: [properties_controller_1.PropertiesController],
        exports: [properties_service_1.PropertiesService, typeorm_1.TypeOrmModule],
    })
], PropertiesModule);
//# sourceMappingURL=properties.module.js.map