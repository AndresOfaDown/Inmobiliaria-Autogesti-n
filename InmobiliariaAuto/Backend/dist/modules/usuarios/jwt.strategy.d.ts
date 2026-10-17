import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private usersRepository;
    constructor(configService: ConfigService, usersRepository: Repository<Usuario>);
    validate(payload: any): Promise<{
        id: string;
        email: string;
        rol: import("./entities/usuario.entity").RolUsuario;
        nombre: string;
        apellido: string;
        telefono: string;
        direccion: string;
        ci: string;
        fotoUrl: string;
        nacimiento: Date;
        activo: boolean;
        creado: Date;
        actualizado: Date;
    }>;
}
export {};
