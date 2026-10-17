import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Pago } from './entities/pago.entity';
import { TipoPago } from './entities/tipo-pago.entity';
import { DetallePago } from './entities/detalle-pago.entity';
import { HistorialPago } from './entities/historial-pago.entity';
import { TransaccionStripe, TipoOperacionStripe } from './entities/transaccion-stripe.entity';
import { ConfiguracionSistema } from './entities/configuracion-sistema.entity';
import { Contrato } from '../contratos/entities/contrato.entity';
import { Comision } from '../contratos/entities/comision.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { UsersService } from '../usuarios/users.service';
export declare class PaymentsService {
    private pagoRepo;
    private tipoPagoRepo;
    private detalleRepo;
    private historialRepo;
    private stripeRepo;
    private configRepo;
    private contratoRepo;
    private comisionRepo;
    private configService;
    private blockchainService;
    private usersService;
    private readonly logger;
    private stripe;
    constructor(pagoRepo: Repository<Pago>, tipoPagoRepo: Repository<TipoPago>, detalleRepo: Repository<DetallePago>, historialRepo: Repository<HistorialPago>, stripeRepo: Repository<TransaccionStripe>, configRepo: Repository<ConfiguracionSistema>, contratoRepo: Repository<Contrato>, comisionRepo: Repository<Comision>, configService: ConfigService, blockchainService: BlockchainService, usersService: UsersService);
    getTiposPago(): Promise<TipoPago[]>;
    createTipoPago(nombre: string): Promise<TipoPago>;
    getConfig(): Promise<ConfiguracionSistema>;
    updateConfig(porcentajeComision: number): Promise<ConfiguracionSistema>;
    getPaymentsForUser(usuarioId: string): Promise<Pago[]>;
    createStripeCheckoutSession(data: {
        contratoId: string;
        pagadorId: string;
        tipoOperacion: TipoOperacionStripe;
        monto: number;
        moneda?: string;
        concepto?: string;
    }): Promise<{
        sessionId: string;
        url: string;
        transaccionId: string;
        simulated: boolean;
    }>;
    confirmPayment(stripeSessionId: string, paymentIntentId?: string): Promise<{
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
    getFinancialMetrics(): Promise<{
        totalRecaudado: number;
        totalComisiones: number;
        porcentajeComisionActual: number;
        totalPagos: number;
        totalTransaccionesStripe: number;
        stripeExitosas: number;
        tasaConversionStripe: string;
    }>;
}
