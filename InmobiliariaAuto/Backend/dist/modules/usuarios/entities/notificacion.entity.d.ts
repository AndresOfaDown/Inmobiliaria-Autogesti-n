import { Usuario } from './usuario.entity';
export declare enum TipoNotificacion {
    INFO = "info",
    ALERTA = "alerta",
    RECORDATORIO = "recordatorio",
    PAGO = "pago",
    CONFIRMACION = "confirmacion"
}
export declare enum OrigenNotificacion {
    SISTEMA = "sistema",
    USUARIO = "usuario"
}
export declare class Notificacion {
    id: string;
    usuarioId: string;
    usuario: Usuario;
    tipo: TipoNotificacion;
    origen: OrigenNotificacion;
    titulo: string;
    mensaje: string;
    leida: boolean;
    creado: Date;
}
