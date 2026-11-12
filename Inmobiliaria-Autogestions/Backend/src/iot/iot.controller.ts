import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
  Ip,
} from '@nestjs/common';
import { IotService } from './iot.service';
import { CreateDispositivoDto } from './dto/create-dispositivo.dto';
import { AccionDispositivoDto } from './dto/accion-dispositivo.dto';
import { CreateReglaAccesoDto } from './dto/create-regla.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('iot')
@UseGuards(JwtAuthGuard)
export class IotController {
  constructor(private readonly iotService: IotService) {}

  // ─── LISTADO DE DISPOSITIVOS POR INMUEBLE ────────────────────────
  @Get('inmuebles/:inmuebleId/dispositivos')
  listarPorInmueble(
    @Param('inmuebleId', ParseIntPipe) inmuebleId: number,
    @Request() req: any,
  ) {
    return this.iotService.listarPorInmueble(inmuebleId, req.user);
  }

  // ─── CREAR DISPOSITIVO IOT ────────────────────────────────────────
  @Post('dispositivos')
  crearDispositivo(@Body() dto: CreateDispositivoDto, @Request() req: any) {
    return this.iotService.crearDispositivo(dto, req.user);
  }

  // ─── OBTENER DETALLES DE UN DISPOSITIVO ───────────────────────────
  @Get('dispositivos/:id')
  obtener(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.iotService.obtener(id, req.user);
  }

  // ─── ACTUALIZAR DISPOSITIVO ───────────────────────────────────────
  @Put('dispositivos/:id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.iotService.actualizarDispositivo(id, body, req.user);
  }

  // ─── ELIMINAR DISPOSITIVO ─────────────────────────────────────────
  @Delete('dispositivos/:id')
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.iotService.eliminarDispositivo(id, req.user);
  }

  // ─── MIS LLAVES DIGITALES (Para Inquilinos y Propietarios) ─────────
  @Get('mis-llaves')
  obtenerMisLlaves(@Request() req: any) {
    return this.iotService.obtenerMisLlaves(req.user);
  }

  // ─── EJECUTAR ACCIÓN (Abrir / Cerrar / PIN) ───────────────────────
  @Post('dispositivos/:id/accion')
  ejecutarAccion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AccionDispositivoDto,
    @Request() req: any,
    @Ip() ip: string,
  ) {
    return this.iotService.ejecutarAccion(id, dto, req.user, ip);
  }

  // ─── HISTORIAL DE ACCIONES ────────────────────────────────────────
  @Get('dispositivos/:id/historial')
  obtenerHistorial(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.iotService.obtenerHistorial(id, req.user);
  }

  // ─── REGLAS DE ACCESO ─────────────────────────────────────────────
  @Post('reglas-acceso')
  crearReglaAcceso(
    @Body() dto: CreateReglaAccesoDto,
    @Request() req: any,
  ) {
    return this.iotService.crearReglaAcceso(dto, req.user);
  }

  @Delete('reglas-acceso/:id')
  revocarReglaAcceso(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.iotService.revocarReglaAcceso(id, req.user);
  }
}
