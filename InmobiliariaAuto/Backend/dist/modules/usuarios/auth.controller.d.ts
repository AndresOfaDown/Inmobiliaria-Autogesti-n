import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(body: any): Promise<{
        user: {
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
        };
        accessToken: string;
    }>;
    login(body: any): Promise<{
        user: {
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
        };
        accessToken: string;
    }>;
    getProfile(user: any): any;
}
