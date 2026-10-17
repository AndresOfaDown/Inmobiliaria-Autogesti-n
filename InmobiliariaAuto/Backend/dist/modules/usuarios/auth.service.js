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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const usuario_entity_1 = require("./entities/usuario.entity");
let AuthService = class AuthService {
    constructor(usersRepository, jwtService) {
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
    }
    async register(data) {
        const existing = await this.usersRepository.findOne({
            where: { email: data.email.toLowerCase() },
        });
        if (existing) {
            throw new common_1.ConflictException('El correo electrónico ya se encuentra registrado');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = this.usersRepository.create({
            email: data.email.toLowerCase(),
            password: hashedPassword,
            nombre: data.nombre,
            apellido: data.apellido || '',
            rol: data.rol || usuario_entity_1.RolUsuario.USUARIO,
            telefono: data.telefono || '',
            ci: data.ci || '',
            direccion: data.direccion || '',
            activo: true,
        });
        const saved = await this.usersRepository.save(user);
        const token = this.generateToken(saved);
        const { password, ...userWithoutPassword } = saved;
        return {
            user: userWithoutPassword,
            accessToken: token,
        };
    }
    async login(email, pass) {
        const user = await this.usersRepository.findOne({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const match = await bcrypt.compare(pass, user.password);
        if (!match) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        if (!user.activo) {
            throw new common_1.UnauthorizedException('Tu cuenta ha sido desactivada');
        }
        const token = this.generateToken(user);
        const { password, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken: token,
        };
    }
    generateToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            rol: user.rol,
            nombre: user.nombre,
        };
        return this.jwtService.sign(payload);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map