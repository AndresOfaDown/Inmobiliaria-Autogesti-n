import { Inmueble } from './inmueble.entity';
import { Multimedia } from './multimedia.entity';
export declare class Hotspot {
    id: string;
    inmuebleId: string;
    inmueble: Inmueble;
    escenaOrigenId: string;
    escenaOrigen: Multimedia;
    escenaDestinoId: string;
    escenaDestino: Multimedia;
    pitch: number;
    yaw: number;
    textoAyuda: string;
}
