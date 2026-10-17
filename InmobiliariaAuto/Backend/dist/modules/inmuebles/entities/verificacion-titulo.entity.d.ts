import { Inmueble } from './inmueble.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
export declare enum EstadoVerificacion {
    PENDIENTE = "pendiente",
    PROCESANDO = "procesando",
    VERIFICADO = "verificado",
    OBSERVADO = "observado",
    RECHAZADO = "rechazado"
}
export declare class VerificacionTitulo {
    id: string;
    inmuebleId: string;
    inmueble: Inmueble;
    solicitadoPorId: string;
    solicitadoPor: Usuario;
    archivoTituloUrl: string;
    textoOcr: string;
    resultadoIa: any;
    estado: EstadoVerificacion;
    scoreConfianza: number;
    resumenPublico: string;
    hashCertificado: string;
    creado: Date;
    actualizado: Date;
}
