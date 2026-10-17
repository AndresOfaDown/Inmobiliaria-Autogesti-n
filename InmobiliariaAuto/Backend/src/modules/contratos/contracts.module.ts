import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Contrato } from './entities/contrato.entity';
import { TipoContrato } from './entities/tipo-contrato.entity';
import { Comision } from './entities/comision.entity';
import { Inmueble } from '../inmuebles/entities/inmueble.entity';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { UsersModule } from '../usuarios/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contrato, TipoContrato, Comision, Inmueble]),
    UsersModule,
  ],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [ContractsService, TypeOrmModule],
})
export class ContractsModule {}
