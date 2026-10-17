import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Inmueble } from './entities/inmueble.entity';
import { TipoInmueble } from './entities/tipo-inmueble.entity';
import { Direccion } from './entities/direccion.entity';
import { Multimedia } from './entities/multimedia.entity';
import { Hotspot } from './entities/hotspot.entity';
import { Publicacion } from './entities/publicacion.entity';
import { Cita } from './entities/cita.entity';
import { HorarioDisponible } from './entities/horario-disponible.entity';
import { VerificacionTitulo } from './entities/verificacion-titulo.entity';
import { AccesoRecorrido360 } from './entities/acceso-recorrido.entity';
import { Favorito } from './entities/favorito.entity';

import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { AiModule } from '../ia/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inmueble,
      TipoInmueble,
      Direccion,
      Multimedia,
      Hotspot,
      Publicacion,
      Cita,
      HorarioDisponible,
      VerificacionTitulo,
      AccesoRecorrido360,
      Favorito,
    ]),
    AiModule,
  ],
  providers: [PropertiesService],
  controllers: [PropertiesController],
  exports: [PropertiesService, TypeOrmModule],
})
export class PropertiesModule {}
