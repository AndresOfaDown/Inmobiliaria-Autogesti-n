"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const usuario_entity_1 = require("./entities/usuario.entity");
const agenda_entity_1 = require("./entities/agenda.entity");
const notificacion_entity_1 = require("./entities/notificacion.entity");
const bloqueo_entity_1 = require("./entities/bloqueo.entity");
const resena_entity_1 = require("./entities/resena.entity");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const jwt_strategy_1 = require("./jwt.strategy");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([usuario_entity_1.Usuario, agenda_entity_1.Agenda, notificacion_entity_1.Notificacion, bloqueo_entity_1.Bloqueo, resena_entity_1.Resena]),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.get('JWT_SECRET') || 'super_secret_jwt_key_inmobiliaria_autogestion_2026',
                    signOptions: { expiresIn: (config.get('JWT_EXPIRES_IN') || '7d') },
                }),
            }),
            config_1.ConfigModule,
        ],
        providers: [auth_service_1.AuthService, users_service_1.UsersService, jwt_strategy_1.JwtStrategy],
        controllers: [auth_controller_1.AuthController, users_controller_1.UsersController],
        exports: [auth_service_1.AuthService, users_service_1.UsersService, jwt_strategy_1.JwtStrategy, typeorm_1.TypeOrmModule],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map