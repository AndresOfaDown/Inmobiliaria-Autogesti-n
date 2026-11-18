import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  Response as Res,
  ParseIntPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { PagosService } from './pagos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  // ─── CONFIGURACIÓN DE PLATAFORMA ──────────────────────────────────
  @Get(['configuracion', 'configuracion/'])
  obtenerConfiguracion() {
    return this.pagosService.obtenerConfiguracion();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(['configuracion/:id', 'configuracion/:id/'])
  actualizarConfiguracion(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.pagosService.actualizarConfiguracion(id, data);
  }

  // ─── HU-24 REPORTES FINANCIEROS Y GRÁFICOS ────────────────────────
  @Get(['reportes', 'reportes/'])
  obtenerReportes(@Request() req: any, @Query() query: any) {
    const user = req.user || null;
    return this.pagosService.obtenerReportes(user, query);
  }

  // ─── LISTADO DE PAGOS ─────────────────────────────────────────────
  @Get(['lista', 'lista/', 'panel/lista', 'panel/lista/'])
  listarPagos(@Request() req: any, @Query() query: any) {
    const user = req.user || null;
    return this.pagosService.listarPagos(user, query);
  }

  @Get(['tipos-pago', 'tipos-pago/'])
  listarTiposPago() {
    return [
      { id: 1, nombre: 'Transferencia Bancaria / QR' },
      { id: 2, nombre: 'Tarjeta de Crédito / Débito (Stripe)' },
      { id: 3, nombre: 'Efectivo / Depósito' },
    ];
  }

  // ─── PROCESAR NUEVO PAGO (INQUILINO / CLIENTE) ────────────────────
  @UseGuards(JwtAuthGuard)
  @Post(['procesar', 'procesar/', 'crear', 'crear/'])
  procesarPago(@Request() req: any, @Body() dto: any) {
    return this.pagosService.procesarPago(req.user, dto);
  }

  // ─── VERIFICACIÓN PÚBLICA DE COMPROBANTE (CÓDIGO QR) ──────────────
  @Get(['verificar/:id', 'verificar/:id/'])
  verificarComprobante(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.verificarComprobantePublico(id);
  }

  // ─── DESCARGA DE COMPROBANTE OFICIAL EN PDF ────────────────────────
  @Get(['comprobante/:id/pdf', 'comprobante/:id/pdf/'])
  async descargarComprobantePdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.pagosService.generarComprobantePDF(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Comprobante_Pago_REC-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
