import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { InmueblesModule } from './inmuebles/inmuebles.module';
import { PagosModule } from './pagos/pagos.module';
import { ContratosModule } from './contratos/contratos.module';
import { IotModule } from './iot/iot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    InmueblesModule,
    PagosModule,
    ContratosModule,
    IotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
