import { Module } from '@nestjs/common';
import { ContratosController } from './contratos.controller';
import { TiposContratoController } from './tipos-contrato.controller';
import { ContratosService } from './contratos.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContratosController, TiposContratoController],
  providers: [ContratosService],
  exports: [ContratosService],
})
export class ContratosModule {}
