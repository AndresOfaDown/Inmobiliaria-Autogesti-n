import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Headers,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('tipos')
  getTipos() {
    return this.paymentsService.getTiposPago();
  }

  @Post('tipos')
  createTipo(@Body() body: { nombre: string }) {
    return this.paymentsService.createTipoPago(body.nombre);
  }

  @Get('config')
  getConfig() {
    return this.paymentsService.getConfig();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('config')
  updateConfig(@Body() body: { porcentajeComision: number }) {
    return this.paymentsService.updateConfig(body.porcentajeComision);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-payments')
  getMyPayments(@CurrentUser() user: any) {
    return this.paymentsService.getPaymentsForUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-checkout-session')
  createCheckout(@CurrentUser() user: any, @Body() data: any) {
    return this.paymentsService.createStripeCheckoutSession({
      ...data,
      pagadorId: user.id,
    });
  }

  // Confirmar pago (utilizado por el frontend para simular checkout o tras retorno de Stripe)
  @UseGuards(JwtAuthGuard)
  @Post('confirm-session')
  confirmPayment(@Body() body: { sessionId: string; paymentIntentId?: string }) {
    return this.paymentsService.confirmPayment(body.sessionId, body.paymentIntentId);
  }

  // Webhook oficial de Stripe
  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    // Si viene evento de Stripe Checkout
    if (body.type === 'checkout.session.completed') {
      const session = body.data?.object;
      if (session?.id) {
        await this.paymentsService.confirmPayment(session.id, session.payment_intent);
      }
    }
    return { received: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('metrics')
  getMetrics() {
    return this.paymentsService.getFinancialMetrics();
  }
}
