import { Contrato } from './contrato.entity';
export declare class Comision {
    id: string;
    contratoId: string;
    contrato: Contrato;
    pagoId: string;
    porcentaje: number;
    monto: number;
    fecha: Date;
    pagada: boolean;
    descripcion: string;
    creado: Date;
}
