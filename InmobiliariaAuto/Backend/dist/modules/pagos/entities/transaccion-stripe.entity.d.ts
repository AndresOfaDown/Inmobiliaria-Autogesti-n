import { Contrato } from '../../contratos/entities/contrato.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
export declare enum TipoOperacionStripe {
    ALQUILER = "alquiler",
    DEPOSITO = "deposito",
    MENSUALIDAD = "mensualidad"
}
export declare enum EstadoStripe {
    PENDIENTE = "pendiente",
    COMPLETADA = "completada",
    FALLIDA = "fallida",
    REEMBOLSADA = "reembolsada"
}
export declare class TransaccionStripe {
    id: string;
    contratoId: string;
    contrato: Contrato;
    pagadorId: string;
    pagador: Usuario;
    propietarioId: string;
    propietario: Usuario;
    tipoOperacion: TipoOperacionStripe;
    monto: number;
    moneda: string;
    stripeSessionId: string;
    stripePaymentIntent: string;
    estado: EstadoStripe;
    comprobanteUrl: string;
    blockchainTxId: string;
    creado: Date;
    actualizado: Date;
}
