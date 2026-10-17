export declare enum RolUsuario {
    ADMIN = "admin",
    USUARIO = "usuario"
}
export declare class Usuario {
    id: string;
    email: string;
    password: string;
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
}
