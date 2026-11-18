import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Res,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inmuebles/contratos')
@UseGuards(JwtAuthGuard)
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}

  @Get(['', '/', 'panel/contratos', 'panel/contratos/'])
  listar(@Request() req: any) {
    return this.contratosService.listar(req.user);
  }

  @Get(['tipos', 'tipos/'])
  listarTipos() {
    return this.contratosService.listarTipos();
  }

  @Post(['', 'crear-con-ia'])
  crear(@Body() dto: CreateContratoDto, @Request() req: any) {
    return this.contratosService.crear(dto, req.user);
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.contratosService.obtener(id, req.user);
  }

  @Post(':id/aceptar')
  aceptar(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.contratosService.aceptar(id, req.user);
  }

  @Post(':id/rechazar')
  rechazar(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo: string,
    @Request() req: any,
  ) {
    return this.contratosService.rechazar(id, motivo, req.user);
  }

  @Post(':id/chat-ia')
  chatIA(
    @Param('id', ParseIntPipe) id: number,
    @Body('mensajes') mensajes: any[],
    @Request() req: any,
  ) {
    return this.contratosService.chatIA(id, mensajes, req.user).then((respuesta) => ({ respuesta }));
  }

  @Get(':id/pdf')
  async descargarPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.contratosService.generarPDF(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Contrato_Oficial_${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Post(':id/generar-ia')
  async generarIa(
    @Param('id', ParseIntPipe) id: number,
    @Body('instrucciones') instrucciones: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.contratosService.generarPDF(id, instrucciones);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=Contrato_Oficial_${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
