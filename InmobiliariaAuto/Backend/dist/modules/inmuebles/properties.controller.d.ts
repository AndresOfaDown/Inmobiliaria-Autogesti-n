import { PropertiesService } from './properties.service';
import { EstadoCita } from './entities/cita.entity';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    getTipos(): Promise<import("./entities/tipo-inmueble.entity").TipoInmueble[]>;
    createTipo(body: {
        nombre: string;
        descripcion?: string;
    }): Promise<import("./entities/tipo-inmueble.entity").TipoInmueble>;
    search(query: any): Promise<import("./entities/inmueble.entity").Inmueble[]>;
    getMyProperties(user: any): Promise<import("./entities/inmueble.entity").Inmueble[]>;
    getById(id: string): Promise<{
        verificacionLegal: import("./entities/verificacion-titulo.entity").VerificacionTitulo;
        id: string;
        propietarioId: string;
        propietario: import("../usuarios/entities/usuario.entity").Usuario;
        tipoId: string;
        tipo: import("./entities/tipo-inmueble.entity").TipoInmueble;
        direccionId: string;
        direccion: import("./entities/direccion.entity").Direccion;
        titulo: string;
        descripcion: string;
        largo: number;
        ancho: number;
        superficie: number;
        habitaciones: number;
        banos: number;
        garaje: boolean;
        estado: import("./entities/inmueble.entity").EstadoInmueble;
        gps: string;
        modelo3dUrl: string;
        valorActivo: number;
        hashBlockchain: string;
        multimedia: import("./entities/multimedia.entity").Multimedia[];
        publicaciones: import("./entities/publicacion.entity").Publicacion[];
        creado: Date;
        actualizado: Date;
    }>;
    createProperty(user: any, data: any): Promise<{
        verificacionLegal: import("./entities/verificacion-titulo.entity").VerificacionTitulo;
        id: string;
        propietarioId: string;
        propietario: import("../usuarios/entities/usuario.entity").Usuario;
        tipoId: string;
        tipo: import("./entities/tipo-inmueble.entity").TipoInmueble;
        direccionId: string;
        direccion: import("./entities/direccion.entity").Direccion;
        titulo: string;
        descripcion: string;
        largo: number;
        ancho: number;
        superficie: number;
        habitaciones: number;
        banos: number;
        garaje: boolean;
        estado: import("./entities/inmueble.entity").EstadoInmueble;
        gps: string;
        modelo3dUrl: string;
        valorActivo: number;
        hashBlockchain: string;
        multimedia: import("./entities/multimedia.entity").Multimedia[];
        publicaciones: import("./entities/publicacion.entity").Publicacion[];
        creado: Date;
        actualizado: Date;
    }>;
    updateProperty(id: string, user: any, data: any): Promise<{
        verificacionLegal: import("./entities/verificacion-titulo.entity").VerificacionTitulo;
        id: string;
        propietarioId: string;
        propietario: import("../usuarios/entities/usuario.entity").Usuario;
        tipoId: string;
        tipo: import("./entities/tipo-inmueble.entity").TipoInmueble;
        direccionId: string;
        direccion: import("./entities/direccion.entity").Direccion;
        titulo: string;
        descripcion: string;
        largo: number;
        ancho: number;
        superficie: number;
        habitaciones: number;
        banos: number;
        garaje: boolean;
        estado: import("./entities/inmueble.entity").EstadoInmueble;
        gps: string;
        modelo3dUrl: string;
        valorActivo: number;
        hashBlockchain: string;
        multimedia: import("./entities/multimedia.entity").Multimedia[];
        publicaciones: import("./entities/publicacion.entity").Publicacion[];
        creado: Date;
        actualizado: Date;
    }>;
    deleteProperty(id: string, user: any): Promise<{
        success: boolean;
    }>;
    addMultimedia(id: string, body: {
        items: any[];
    }): Promise<any[]>;
    deleteMultimedia(mediaId: string): Promise<{
        success: boolean;
    }>;
    addHotspot(data: any): Promise<import("./entities/hotspot.entity").Hotspot>;
    deleteHotspot(id: string): Promise<{
        success: boolean;
    }>;
    verifyTitle(id: string, user: any, body: {
        archivoTituloUrl: string;
        textoOcr?: string;
    }): Promise<import("./entities/verificacion-titulo.entity").VerificacionTitulo>;
    requestAppointment(user: any, data: any): Promise<import("./entities/cita.entity").Cita>;
    getMyAppointments(user: any): Promise<import("./entities/cita.entity").Cita[]>;
    updateAppointmentStatus(id: string, body: {
        estado: EstadoCita;
    }): Promise<import("./entities/cita.entity").Cita>;
    toggleFavorite(id: string, user: any): Promise<{
        favorited: boolean;
    }>;
    getFavorites(user: any): Promise<import("./entities/favorito.entity").Favorito[]>;
}
