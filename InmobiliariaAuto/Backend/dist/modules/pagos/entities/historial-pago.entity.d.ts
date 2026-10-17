import { Pago } from './pago.entity';
import { EstadoPago } from './pago.enum';
import { Usuario } from '../../usuarios/entities/usuario.entity';
export declare class HistorialPago {
    id: string;
    pagoId: string;
    pago: Pago;
    estadoAnterior: EstadoPago;
    estadoNuevo: EstadoPago;
    comentario: string;
    usuarioId: string;
    usuario: Usuario;
    fecha: Date;
}
