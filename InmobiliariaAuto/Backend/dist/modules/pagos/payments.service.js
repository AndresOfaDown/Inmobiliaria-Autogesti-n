"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
const pago_entity_1 = require("./entities/pago.entity");
const tipo_pago_entity_1 = require("./entities/tipo-pago.entity");
const detalle_pago_entity_1 = require("./entities/detalle-pago.entity");
const historial_pago_entity_1 = require("./entities/historial-pago.entity");
const transaccion_stripe_entity_1 = require("./entities/transaccion-stripe.entity");
const configuracion_sistema_entity_1 = require("./entities/configuracion-sistema.entity");
const contrato_entity_1 = require("../contratos/entities/contrato.entity");
const comision_entity_1 = require("../contratos/entities/comision.entity");
const blockchain_service_1 = require("../blockchain/blockchain.service");
const users_service_1 = require("../usuarios/users.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(pagoRepo, tipoPagoRepo, detalleRepo, historialRepo, stripeRepo, configRepo, contratoRepo, comisionRepo, configService, blockchainService, usersService) {
        this.pagoRepo = pagoRepo;
        this.tipoPagoRepo = tipoPagoRepo;
        this.detalleRepo = detalleRepo;
        this.historialRepo = historialRepo;
        this.stripeRepo = stripeRepo;
        this.configRepo = configRepo;
        this.contratoRepo = contratoRepo;
        this.comisionRepo = comisionRepo;
        this.configService = configService;
        this.blockchainService = blockchainService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        const key = this.configService.get('STRIPE_SECRET_KEY') || 'sk_test_placeholder';
        this.stripe = new stripe_1.default(key, { apiVersion: '2025-01-27.acacia' });
    }
    async getTiposPago() {
        return this.tipoPagoRepo.find();
    }
    async createTipoPago(nombre) {
        const tipo = this.tipoPagoRepo.create({ nombre });
        return this.tipoPagoRepo.save(tipo);
    }
    async getConfig() {
        let conf = await this.configRepo.findOne({ where: {} });
        if (!conf) {
            conf = this.configRepo.create({ porcentajeComisionPlataforma: 5.0 });
            conf = await this.configRepo.save(conf);
        }
        return conf;
    }
    async updateConfig(porcentajeComision) {
        const conf = await this.getConfig();
        conf.porcentajeComisionPlataforma = porcentajeComision;
        return this.configRepo.save(conf);
    }
    async getPaymentsForUser(usuarioId) {
        return this.pagoRepo
            .createQueryBuilder('pago')
            .leftJoinAndSelect('pago.contrato', 'contrato')
            .leftJoinAndSelect('contrato.inmueble', 'inmueble')
            .leftJoinAndSelect('inmueble.propietario', 'propietario')
            .leftJoinAndSelect('contrato.inquilino', 'inquilino')
            .leftJoinAndSelect('pago.tipoPago', 'tipoPago')
            .leftJoinAndSelect('pago.detalles', 'detalles')
            .where('pago.usuarioId = :usuarioId OR inmueble.propietarioId = :usuarioId', {
            usuarioId,
        })
            .orderBy('pago.fecha', 'DESC')
            .getMany();
    }
    async createStripeCheckoutSession(data) {
        const contrato = await this.contratoRepo.findOne({
            where: { id: data.contratoId },
            relations: ['inmueble', 'inmueble.propietario'],
        });
        if (!contrato)
            throw new common_1.NotFoundException('Contrato no encontrado');
        const moneda = data.moneda || contrato.moneda || 'USD';
        const concepto = data.concepto || `Pago de ${data.tipoOperacion} para "${contrato.inmueble.titulo}"`;
        let sessionId = `cs_test_mock_${Date.now()}`;
        let sessionUrl = `https://checkout.stripe.com/pay/${sessionId}`;
        try {
            if (this.configService.get('STRIPE_SECRET_KEY')?.startsWith('sk_live') ||
                this.configService.get('STRIPE_SECRET_KEY')?.startsWith('sk_test_51')) {
                const session = await this.stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [
                        {
                            price_data: {
                                currency: moneda.toLowerCase(),
                                product_data: {
                                    name: concepto,
                                    description: `Contrato Ref: ${contrato.id.slice(0, 8)}`,
                                },
                                unit_amount: Math.round(data.monto * 100),
                            },
                            quantity: 1,
                        },
                    ],
                    mode: 'payment',
                    success_url: `http://localhost:5173/dashboard/pagos?success=true&session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `http://localhost:5173/dashboard/pagos?canceled=true`,
                });
                sessionId = session.id;
                sessionUrl = session.url;
            }
        }
        catch (err) {
            this.logger.warn(`Stripe API online fallback, using integrated simulated checkout: ${err.message}`);
        }
        const transaccion = this.stripeRepo.create({
            contratoId: data.contratoId,
            pagadorId: data.pagadorId,
            propietarioId: contrato.inmueble.propietarioId,
            tipoOperacion: data.tipoOperacion,
            monto: data.monto,
            moneda,
            stripeSessionId: sessionId,
            estado: transaccion_stripe_entity_1.EstadoStripe.PENDIENTE,
        });
        await this.stripeRepo.save(transaccion);
        return {
            sessionId,
            url: sessionUrl,
            transaccionId: transaccion.id,
            simulated: !sessionId.startsWith('cs_live'),
        };
    }
    async confirmPayment(stripeSessionId, paymentIntentId) {
        const tx = await this.stripeRepo.findOne({
            where: { stripeSessionId },
            relations: ['contrato', 'contrato.inmueble'],
        });
        if (!tx) {
            throw new common_1.NotFoundException('Transacción Stripe no encontrada');
        }
        if (tx.estado === transaccion_stripe_entity_1.EstadoStripe.COMPLETADA) {
            return { message: 'El pago ya se encontraba completado' };
        }
        tx.estado = transaccion_stripe_entity_1.EstadoStripe.COMPLETADA;
        tx.stripePaymentIntent = paymentIntentId || `pi_${Date.now()}`;
        await this.stripeRepo.save(tx);
        let tipoStripe = await this.tipoPagoRepo.findOne({ where: { nombre: 'Stripe' } });
        if (!tipoStripe) {
            tipoStripe = await this.tipoPagoRepo.save(this.tipoPagoRepo.create({ nombre: 'Stripe' }));
        }
        const pago = this.pagoRepo.create({
            contratoId: tx.contratoId,
            tipoPagoId: tipoStripe.id,
            usuarioId: tx.pagadorId,
            monto: tx.monto,
            referencia: tx.stripeSessionId,
            estado: pago_entity_1.EstadoPago.COMPLETADO,
            observaciones: `Pago procesado exitosamente vía Stripe. Operación: ${tx.tipoOperacion}`,
        });
        const savedPago = await this.pagoRepo.save(pago);
        const detalle = this.detalleRepo.create({
            pagoId: savedPago.id,
            concepto: `Pago de ${tx.tipoOperacion}`,
            monto: tx.monto,
        });
        await this.detalleRepo.save(detalle);
        const hist = this.historialRepo.create({
            pagoId: savedPago.id,
            estadoAnterior: pago_entity_1.EstadoPago.PENDIENTE,
            estadoNuevo: pago_entity_1.EstadoPago.COMPLETADO,
            comentario: 'Confirmación exitosa de pago Stripe',
            usuarioId: tx.pagadorId,
        });
        await this.historialRepo.save(hist);
        const conf = await this.getConfig();
        const comisionMonto = (Number(tx.monto) * Number(conf.porcentajeComisionPlataforma)) / 100;
        const comision = this.comisionRepo.create({
            contratoId: tx.contratoId,
            pagoId: savedPago.id,
            porcentaje: conf.porcentajeComisionPlataforma,
            monto: comisionMonto,
            pagada: true,
            descripcion: `Comisión retenida automáticamente (${conf.porcentajeComisionPlataforma}%) sobre pago ${savedPago.id.slice(0, 8)}`,
        });
        await this.comisionRepo.save(comision);
        const bcTx = this.blockchainService.recordPaymentAudit(savedPago.id, tx.contratoId, tx.pagadorId, Number(tx.monto), tx.moneda, tx.stripeSessionId, tx.stripePaymentIntent);
        savedPago.blockchainTxId = bcTx.txId;
        await this.pagoRepo.save(savedPago);
        tx.blockchainTxId = bcTx.txId;
        await this.stripeRepo.save(tx);
        await this.usersService.createNotification(tx.propietarioId, 'Pago Recibido y Liquidado', `Has recibido el pago de ${tx.monto} ${tx.moneda} correspondiente al contrato "${tx.contrato.inmueble.titulo}". Comisión descontada: ${comisionMonto.toFixed(2)} ${tx.moneda}. Auditado en Blockchain TxID: ${bcTx.txId}`);
        await this.usersService.createNotification(tx.pagadorId, 'Recibo de Pago Emitido', `Tu pago de ${tx.monto} ${tx.moneda} ha sido procesado y certificado en Blockchain. TxID: ${bcTx.txId}`);
        return {
            success: true,
            pagoId: savedPago.id,
            blockchainTxId: bcTx.txId,
            monto: tx.monto,
            comisionMonto,
        };
    }
    async getFinancialMetrics() {
        const config = await this.getConfig();
        const pagosCompletados = await this.pagoRepo.find({
            where: { estado: pago_entity_1.EstadoPago.COMPLETADO },
        });
        const totalRecaudado = pagosCompletados.reduce((sum, p) => sum + Number(p.monto), 0);
        const comisiones = await this.comisionRepo.find();
        const totalComisiones = comisiones.reduce((sum, c) => sum + Number(c.monto), 0);
        const totalTransaccionesStripe = await this.stripeRepo.count();
        const stripeExitosas = await this.stripeRepo.count({
            where: { estado: transaccion_stripe_entity_1.EstadoStripe.COMPLETADA },
        });
        return {
            totalRecaudado,
            totalComisiones,
            porcentajeComisionActual: config.porcentajeComisionPlataforma,
            totalPagos: pagosCompletados.length,
            totalTransaccionesStripe,
            stripeExitosas,
            tasaConversionStripe: totalTransaccionesStripe > 0
                ? ((stripeExitosas / totalTransaccionesStripe) * 100).toFixed(1) + '%'
                : '100%',
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pago_entity_1.Pago)),
    __param(1, (0, typeorm_1.InjectRepository)(tipo_pago_entity_1.TipoPago)),
    __param(2, (0, typeorm_1.InjectRepository)(detalle_pago_entity_1.DetallePago)),
    __param(3, (0, typeorm_1.InjectRepository)(historial_pago_entity_1.HistorialPago)),
    __param(4, (0, typeorm_1.InjectRepository)(transaccion_stripe_entity_1.TransaccionStripe)),
    __param(5, (0, typeorm_1.InjectRepository)(configuracion_sistema_entity_1.ConfiguracionSistema)),
    __param(6, (0, typeorm_1.InjectRepository)(contrato_entity_1.Contrato)),
    __param(7, (0, typeorm_1.InjectRepository)(comision_entity_1.Comision)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        blockchain_service_1.BlockchainService,
        users_service_1.UsersService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map