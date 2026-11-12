import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
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
    // Si la petición trae token (req.user), se asocia; de lo contrario se ejecuta como informe general
    const user = req.user || null;
    return this.pagosService.obtenerReportes(user, query);
  }

  // ─── LISTADO DE PAGOS ─────────────────────────────────────────────
  @Get(['lista', 'lista/'])
  listarPagos(@Request() req: any, @Query() query: any) {
    const user = req.user || null;
    return this.pagosService.listarPagos(user, query);
  }
}
