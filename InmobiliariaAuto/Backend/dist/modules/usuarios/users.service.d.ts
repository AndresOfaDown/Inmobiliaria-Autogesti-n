import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { Agenda } from './entities/agenda.entity';
import { Notificacion, TipoNotificacion, OrigenNotificacion } from './entities/notificacion.entity';
import { Resena } from './entities/resena.entity';
import { Bloqueo } from './entities/bloqueo.entity';
export declare class UsersService {
    private usersRepo;
    private agendaRepo;
    private notifRepo;
    private resenaRepo;
    private bloqueoRepo;
    constructor(usersRepo: Repository<Usuario>, agendaRepo: Repository<Agenda>, notifRepo: Repository<Notificacion>, resenaRepo: Repository<Resena>, bloqueoRepo: Repository<Bloqueo>);
    findAll(): Promise<Usuario[]>;
    findById(id: string): Promise<{
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
    updateProfile(id: string, data: Partial<Usuario>): Promise<{
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
    toggleActive(id: string): Promise<{
        id: string;
        activo: boolean;
    }>;
    getNotifications(usuarioId: string): Promise<Notificacion[]>;
    createNotification(usuarioId: string, titulo: string, mensaje: string, tipo?: TipoNotificacion, origen?: OrigenNotificacion): Promise<Notificacion>;
    markNotificationAsRead(id: string): Promise<{
        success: boolean;
    }>;
    getAgenda(usuarioId: string): Promise<Agenda[]>;
    createAgendaItem(usuarioId: string, data: Partial<Agenda>): Promise<Agenda>;
    getReviewsForInmueble(inmuebleId: string): Promise<Resena[]>;
    addReview(usuarioId: string, inmuebleId: string, calificacion: number, comentario: string): Promise<Resena>;
    blockUser(bloqueadorId: string, bloqueadoId: string): Promise<Bloqueo>;
    unblockUser(bloqueadorId: string, bloqueadoId: string): Promise<{
        success: boolean;
    }>;
    isBlocked(userA: string, userB: string): Promise<boolean>;
}
