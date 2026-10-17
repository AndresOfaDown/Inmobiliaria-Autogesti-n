import { Inmueble } from '../../inmuebles/entities/inmueble.entity';
import { TipoContrato } from './tipo-contrato.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Comision } from './comision.entity';
export declare enum EstadoContrato {
    BORRADOR = "borrador",
    ENVIADO = "enviado",
    ACEPTADO = "aceptado",
    RECHAZADO = "rechazado",
    ACTIVO = "activo",
    FINALIZADO = "finalizado",
    CANCELADO = "cancelado"
}
export declare class Contrato {
    id: string;
    inmuebleId: string;
    inmueble: Inmueble;
    tipoContratoId: string;
    tipoContrato: TipoContrato;
    inquilinoId: string;
    inquilino: Usuario;
    chatId: string;
    inicio: Date;
    fin: Date;
    monto: number;
    moneda: string;
    deposito: number;
    diaPago: number;
    formaPago: string;
    clausulas: string;
    condicionesUso: string;
    penalidades: string;
    politicaCancelacion: string;
    incluyeServicios: string;
    restricciones: string;
    antecedentes: string;
    usoExclusivo: string;
    clausulasEspeciales: string;
    estado: EstadoContrato;
    motivoRechazo: string;
    observaciones: string;
    firmaPropietario: string;
    fechaFirmaPropietario: Date;
    firmaInquilino: string;
    fechaFirmaInquilino: Date;
    blockchainTxId: string;
    blockchainHash: string;
    blockchainBlockNumber: number;
    comisiones: Comision[];
    creado: Date;
    actualizado: Date;
}
