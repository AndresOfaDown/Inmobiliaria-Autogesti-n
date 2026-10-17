import { Usuario } from '../../usuarios/entities/usuario.entity';
import { TipoInmueble } from './tipo-inmueble.entity';
import { Direccion } from './direccion.entity';
import { Multimedia } from './multimedia.entity';
import { Publicacion } from './publicacion.entity';
export declare enum EstadoInmueble {
    DISPONIBLE = "disponible",
    OCUPADO = "ocupado",
    MANTENIMIENTO = "mantenimiento",
    RESERVADO = "reservado",
    OCULTO = "oculto"
}
export declare class Inmueble {
    id: string;
    propietarioId: string;
    propietario: Usuario;
    tipoId: string;
    tipo: TipoInmueble;
    direccionId: string;
    direccion: Direccion;
    titulo: string;
    descripcion: string;
    largo: number;
    ancho: number;
    superficie: number;
    habitaciones: number;
    banos: number;
    garaje: boolean;
    estado: EstadoInmueble;
    gps: string;
    modelo3dUrl: string;
    valorActivo: number;
    hashBlockchain: string;
    multimedia: Multimedia[];
    publicaciones: Publicacion[];
    creado: Date;
    actualizado: Date;
}
