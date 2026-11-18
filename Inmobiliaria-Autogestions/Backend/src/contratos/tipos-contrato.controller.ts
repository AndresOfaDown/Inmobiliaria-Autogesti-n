import { Controller, Get, UseGuards } from '@nestjs/common';
import { ContratosService } from './contratos.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller(['inmuebles/tipos-contrato', 'inmuebles/panel/tipos-contrato'])
export class TiposContratoController {
  constructor(private readonly contratosService: ContratosService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get(['', '/'])
  async listar() {
    return this.contratosService.listarTipos();
  }
}
