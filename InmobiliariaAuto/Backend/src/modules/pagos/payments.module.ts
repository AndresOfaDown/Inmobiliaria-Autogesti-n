import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { Pago } from './entities/pago.entity';
import { TipoPago } from './entities/tipo-pago.entity';
import { DetallePago } from './entities/detalle-pago.entity';
import { HistorialPago } from './entities/historial-pago.entity';
import { TransaccionStripe } from './entities/transaccion-stripe.entity';
import { ConfiguracionSistema } from './entities/configuracion-sistema.entity';
import { Contrato } from '../contratos/entities/contrato.entity';
import { Comision } from '../contratos/entities/comision.entity';

import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { UsersModule } from '../usuarios/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pago,
      TipoPago,
      DetallePago,
      HistorialPago,
      TransaccionStripe,
      ConfiguracionSistema,
      Contrato,
      Comision,
    ]),
    ConfigModule,
    UsersModule,
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService, TypeOrmModule],
})
export class PaymentsModule {}
