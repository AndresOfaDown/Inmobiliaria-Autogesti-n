import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeedService } from './seed.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { TipoInmueble } from '../inmuebles/entities/tipo-inmueble.entity';
import { TipoContrato } from '../contratos/entities/tipo-contrato.entity';
import { TipoPago } from '../pagos/entities/tipo-pago.entity';
import { ConfiguracionSistema } from '../pagos/entities/configuracion-sistema.entity';

import { PropertiesModule } from '../inmuebles/properties.module';
import { ContractsModule } from '../contratos/contracts.module';
import { PaymentsModule } from '../pagos/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      TipoInmueble,
      TipoContrato,
      TipoPago,
      ConfiguracionSistema,
    ]),
    PropertiesModule,
    ContractsModule,
    PaymentsModule,
  ],
  providers: [SeedService],
})
export class SeedModule {}
