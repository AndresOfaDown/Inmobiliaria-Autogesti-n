import { Inmueble } from './inmueble.entity';
import { Hotspot } from './hotspot.entity';
export declare enum TipoMultimedia {
    IMAGEN = "imagen",
    VIDEO = "video",
    PANORAMA360 = "panorama360",
    MUSICA = "musica"
}
export declare class Multimedia {
    id: string;
    inmuebleId: string;
    inmueble: Inmueble;
    tipo: TipoMultimedia;
    archivoUrl: string;
    descripcion: string;
    principal: boolean;
    orden: number;
    hotspotsSalientes: Hotspot[];
}
