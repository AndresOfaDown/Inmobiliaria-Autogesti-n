import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Usuario, RolUsuario } from './entities/usuario.entity';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    constructor(usersRepository: Repository<Usuario>, jwtService: JwtService);
    register(data: {
        email: string;
        password: string;
        nombre: string;
        apellido?: string;
        rol?: RolUsuario;
        telefono?: string;
        ci?: string;
        direccion?: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            rol: RolUsuario;
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
        };
        accessToken: string;
    }>;
    login(email: string, pass: string): Promise<{
        user: {
            id: string;
            email: string;
            rol: RolUsuario;
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
        };
        accessToken: string;
    }>;
    private generateToken;
}
