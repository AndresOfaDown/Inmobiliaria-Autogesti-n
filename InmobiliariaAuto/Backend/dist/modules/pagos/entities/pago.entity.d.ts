import { Contrato } from '../../contratos/entities/contrato.entity';
import { TipoPago } from './tipo-pago.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DetallePago } from './detalle-pago.entity';
import { HistorialPago } from './historial-pago.entity';
import { EstadoPago } from './pago.enum';
export { EstadoPago };
export declare class Pago {
    id: string;
    contratoId: string;
    contrato: Contrato;
    tipoPagoId: string;
    tipoPago: TipoPago;
    usuarioId: string;
    usuario: Usuario;
    monto: number;
    fecha: Date;
    referencia: string;
    comprobanteUrl: string;
    estado: EstadoPago;
    observaciones: string;
    blockchainTxId: string;
    detalles: DetallePago[];
    historial: HistorialPago[];
    creado: Date;
    actualizado: Date;
}
