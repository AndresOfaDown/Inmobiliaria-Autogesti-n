import { Module } from '@nestjs/common';
import { InmueblesController } from './inmuebles.controller';
import { InmueblesService } from './inmuebles.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InmueblesController],
  providers: [InmueblesService],
  exports: [InmueblesService],
})
export class InmueblesModule {}
