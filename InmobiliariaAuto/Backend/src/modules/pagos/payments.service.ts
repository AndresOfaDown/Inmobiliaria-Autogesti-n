import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { Pago, EstadoPago } from './entities/pago.entity';
import { TipoPago } from './entities/tipo-pago.entity';
import { DetallePago } from './entities/detalle-pago.entity';
import { HistorialPago } from './entities/historial-pago.entity';
import { TransaccionStripe, EstadoStripe, TipoOperacionStripe } from './entities/transaccion-stripe.entity';
import { ConfiguracionSistema } from './entities/configuracion-sistema.entity';
import { Contrato } from '../contratos/entities/contrato.entity';
import { Comision } from '../contratos/entities/comision.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { UsersService } from '../usuarios/users.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    @InjectRepository(Pago)
    private pagoRepo: Repository<Pago>,
    @InjectRepository(TipoPago)
    private tipoPagoRepo: Repository<TipoPago>,
    @InjectRepository(DetallePago)
    private detalleRepo: Repository<DetallePago>,
    @InjectRepository(HistorialPago)
    private historialRepo: Repository<HistorialPago>,
    @InjectRepository(TransaccionStripe)
    private stripeRepo: Repository<TransaccionStripe>,
    @InjectRepository(ConfiguracionSistema)
    private configRepo: Repository<ConfiguracionSistema>,
    @InjectRepository(Contrato)
    private contratoRepo: Repository<Contrato>,
    @InjectRepository(Comision)
    private comisionRepo: Repository<Comision>,

    private configService: ConfigService,
    private blockchainService: BlockchainService,
    private usersService: UsersService,
  ) {
    const key = this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_placeholder';
    this.stripe = new Stripe(key, { apiVersion: '2025-01-27.acacia' as any });
  }

  // Tipos de pago
  async getTiposPago() {
    return this.tipoPagoRepo.find();
  }

  async createTipoPago(nombre: string) {
    const tipo = this.tipoPagoRepo.create({ nombre });
    return this.tipoPagoRepo.save(tipo);
  }

  // Configuración del sistema (porcentaje de comisión)
  async getConfig(): Promise<ConfiguracionSistema> {
    let conf = await this.configRepo.findOne({ where: {} });
    if (!conf) {
      conf = this.configRepo.create({ porcentajeComisionPlataforma: 5.0 });
      conf = await this.configRepo.save(conf);
    }
    return conf;
  }

  async updateConfig(porcentajeComision: number): Promise<ConfiguracionSistema> {
    const conf = await this.getConfig();
    conf.porcentajeComisionPlataforma = porcentajeComision;
    return this.configRepo.save(conf);
  }

  // Listar pagos por usuario
  async getPaymentsForUser(usuarioId: string) {
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

  // Crear checkout session de Stripe
  async createStripeCheckoutSession(data: {
    contratoId: string;
    pagadorId: string;
    tipoOperacion: TipoOperacionStripe;
    monto: number;
    moneda?: string;
    concepto?: string;
  }) {
    const contrato = await this.contratoRepo.findOne({
      where: { id: data.contratoId },
      relations: ['inmueble', 'inmueble.propietario'],
    });
    if (!contrato) throw new NotFoundException('Contrato no encontrado');

    const moneda = data.moneda || contrato.moneda || 'USD';
    const concepto = data.concepto || `Pago de ${data.tipoOperacion} para "${contrato.inmueble.titulo}"`;

    let sessionId = `cs_test_mock_${Date.now()}`;
    let sessionUrl = `https://checkout.stripe.com/pay/${sessionId}`;

    try {
      // Intentar crear sesión real si la key es válida
      if (this.configService.get<string>('STRIPE_SECRET_KEY')?.startsWith('sk_live') ||
          this.configService.get<string>('STRIPE_SECRET_KEY')?.startsWith('sk_test_51')) {
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
    } catch (err) {
      this.logger.warn(`Stripe API online fallback, using integrated simulated checkout: ${err.message}`);
    }

    // Registrar TransaccionStripe en BD
    const transaccion = this.stripeRepo.create({
      contratoId: data.contratoId,
      pagadorId: data.pagadorId,
      propietarioId: contrato.inmueble.propietarioId,
      tipoOperacion: data.tipoOperacion,
      monto: data.monto,
      moneda,
      stripeSessionId: sessionId,
      estado: EstadoStripe.PENDIENTE,
    });
    await this.stripeRepo.save(transaccion);

    return {
      sessionId,
      url: sessionUrl,
      transaccionId: transaccion.id,
      simulated: !sessionId.startsWith('cs_live'),
    };
  }

  // Confirmar pago (utilizado por webhook de Stripe o por simulación de checkout seguro)
  async confirmPayment(stripeSessionId: string, paymentIntentId?: string) {
    const tx = await this.stripeRepo.findOne({
      where: { stripeSessionId },
      relations: ['contrato', 'contrato.inmueble'],
    });

    if (!tx) {
      throw new NotFoundException('Transacción Stripe no encontrada');
    }

    if (tx.estado === EstadoStripe.COMPLETADA) {
      return { message: 'El pago ya se encontraba completado' };
    }

    tx.estado = EstadoStripe.COMPLETADA;
    tx.stripePaymentIntent = paymentIntentId || `pi_${Date.now()}`;
    await this.stripeRepo.save(tx);

    // Obtener tipo de pago Stripe
    let tipoStripe = await this.tipoPagoRepo.findOne({ where: { nombre: 'Stripe' } });
    if (!tipoStripe) {
      tipoStripe = await this.tipoPagoRepo.save(
        this.tipoPagoRepo.create({ nombre: 'Stripe' }),
      );
    }

    // Crear registro en Pago
    const pago = this.pagoRepo.create({
      contratoId: tx.contratoId,
      tipoPagoId: tipoStripe.id,
      usuarioId: tx.pagadorId,
      monto: tx.monto,
      referencia: tx.stripeSessionId,
      estado: EstadoPago.COMPLETADO,
      observaciones: `Pago procesado exitosamente vía Stripe. Operación: ${tx.tipoOperacion}`,
    });
    const savedPago = await this.pagoRepo.save(pago);

    // Crear detalle de pago
    const detalle = this.detalleRepo.create({
      pagoId: savedPago.id,
      concepto: `Pago de ${tx.tipoOperacion}`,
      monto: tx.monto,
    });
    await this.detalleRepo.save(detalle);

    // Historial
    const hist = this.historialRepo.create({
      pagoId: savedPago.id,
      estadoAnterior: EstadoPago.PENDIENTE,
      estadoNuevo: EstadoPago.COMPLETADO,
      comentario: 'Confirmación exitosa de pago Stripe',
      usuarioId: tx.pagadorId,
    });
    await this.historialRepo.save(hist);

    // Calcular y liquidar comisión de la plataforma
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

    // 3. Auditoría Blockchain inalterable
    const bcTx = this.blockchainService.recordPaymentAudit(
      savedPago.id,
      tx.contratoId,
      tx.pagadorId,
      Number(tx.monto),
      tx.moneda,
      tx.stripeSessionId,
      tx.stripePaymentIntent,
    );

    savedPago.blockchainTxId = bcTx.txId;
    await this.pagoRepo.save(savedPago);

    tx.blockchainTxId = bcTx.txId;
    await this.stripeRepo.save(tx);

    // Notificaciones
    await this.usersService.createNotification(
      tx.propietarioId,
      'Pago Recibido y Liquidado',
      `Has recibido el pago de ${tx.monto} ${tx.moneda} correspondiente al contrato "${tx.contrato.inmueble.titulo}". Comisión descontada: ${comisionMonto.toFixed(2)} ${tx.moneda}. Auditado en Blockchain TxID: ${bcTx.txId}`,
    );

    await this.usersService.createNotification(
      tx.pagadorId,
      'Recibo de Pago Emitido',
      `Tu pago de ${tx.monto} ${tx.moneda} ha sido procesado y certificado en Blockchain. TxID: ${bcTx.txId}`,
    );

    return {
      success: true,
      pagoId: savedPago.id,
      blockchainTxId: bcTx.txId,
      monto: tx.monto,
      comisionMonto,
    };
  }

  // Métricas financieras globales (Admin)
  async getFinancialMetrics() {
    const config = await this.getConfig();

    const pagosCompletados = await this.pagoRepo.find({
      where: { estado: EstadoPago.COMPLETADO },
    });

    const totalRecaudado = pagosCompletados.reduce(
      (sum, p) => sum + Number(p.monto),
      0,
    );

    const comisiones = await this.comisionRepo.find();
    const totalComisiones = comisiones.reduce(
      (sum, c) => sum + Number(c.monto),
      0,
    );

    const totalTransaccionesStripe = await this.stripeRepo.count();
    const stripeExitosas = await this.stripeRepo.count({
      where: { estado: EstadoStripe.COMPLETADA },
    });

    return {
      totalRecaudado,
      totalComisiones,
      porcentajeComisionActual: config.porcentajeComisionPlataforma,
      totalPagos: pagosCompletados.length,
      totalTransaccionesStripe,
      stripeExitosas,
      tasaConversionStripe:
        totalTransaccionesStripe > 0
          ? ((stripeExitosas / totalTransaccionesStripe) * 100).toFixed(1) + '%'
          : '100%',
    };
  }
}
