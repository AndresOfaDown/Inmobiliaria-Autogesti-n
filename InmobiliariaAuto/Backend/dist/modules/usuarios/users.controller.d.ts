import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAllUsers(): Promise<import("./entities/usuario.entity").Usuario[]>;
    toggleActive(id: string): Promise<{
        id: string;
        activo: boolean;
    }>;
    getProfile(user: any): Promise<{
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
    updateProfile(user: any, data: any): Promise<{
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
    getNotifications(user: any): Promise<import("./entities/notificacion.entity").Notificacion[]>;
    markNotificationRead(id: string): Promise<{
        success: boolean;
    }>;
    getAgenda(user: any): Promise<import("./entities/agenda.entity").Agenda[]>;
    createAgendaItem(user: any, data: any): Promise<import("./entities/agenda.entity").Agenda>;
    getReviews(inmuebleId: string): Promise<import("./entities/resena.entity").Resena[]>;
    addReview(user: any, body: {
        inmuebleId: string;
        calificacion: number;
        comentario: string;
    }): Promise<import("./entities/resena.entity").Resena>;
    blockUser(user: any, targetId: string): Promise<import("./entities/bloqueo.entity").Bloqueo>;
    unblockUser(user: any, targetId: string): Promise<{
        success: boolean;
    }>;
}
