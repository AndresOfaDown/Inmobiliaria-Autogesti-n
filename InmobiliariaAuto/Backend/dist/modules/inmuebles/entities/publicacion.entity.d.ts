import { Inmueble } from './inmueble.entity';
export declare enum TipoOferta {
    ALQUILER = "alquiler",
    VENTA = "venta",
    ANTICRETICO = "anticretico"
}
export declare enum EstadoPublicacion {
    BORRADOR = "borrador",
    ACTIVA = "activa",
    PAUSADA = "pausada",
    FINALIZADA = "finalizada"
}
export declare class Publicacion {
    id: string;
    inmuebleId: string;
    inmueble: Inmueble;
    tipoOferta: TipoOferta;
    precio: number;
    moneda: string;
    estado: EstadoPublicacion;
    creado: Date;
    actualizado: Date;
}
