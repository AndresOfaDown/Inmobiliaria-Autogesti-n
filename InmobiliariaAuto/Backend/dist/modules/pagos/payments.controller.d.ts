import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getTipos(): Promise<import("./entities/tipo-pago.entity").TipoPago[]>;
    createTipo(body: {
        nombre: string;
    }): Promise<import("./entities/tipo-pago.entity").TipoPago>;
    getConfig(): Promise<import("./entities/configuracion-sistema.entity").ConfiguracionSistema>;
    updateConfig(body: {
        porcentajeComision: number;
    }): Promise<import("./entities/configuracion-sistema.entity").ConfiguracionSistema>;
    getMyPayments(user: any): Promise<import("./entities/pago.entity").Pago[]>;
    createCheckout(user: any, data: any): Promise<{
        sessionId: string;
        url: string;
        transaccionId: string;
        simulated: boolean;
    }>;
    confirmPayment(body: {
        sessionId: string;
        paymentIntentId?: string;
    }): Promise<{
        message: string;
        success?: undefined;
        pagoId?: undefined;
        blockchainTxId?: undefined;
        monto?: undefined;
        comisionMonto?: undefined;
    } | {
        success: boolean;
        pagoId: string;
        blockchainTxId: string;
        monto: number;
        comisionMonto: number;
        message?: undefined;
    }>;
    handleWebhook(body: any): Promise<{
        received: boolean;
    }>;
    getMetrics(): Promise<{
        totalRecaudado: number;
        totalComisiones: number;
        porcentajeComisionActual: number;
        totalPagos: number;
        totalTransaccionesStripe: number;
        stripeExitosas: number;
        tasaConversionStripe: string;
    }>;
}
