import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('ia')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generar-contrato')
  async generarContrato(@Body() body: any) {
    return this.aiService.generateLegalContract(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verificar-titulo')
  async verificarTitulo(@Body() body: { textoOcr: string; inmuebleTitulo: string }) {
    return this.aiService.verifyPropertyDeed(body.textoOcr || '', body.inmuebleTitulo || '');
  }
}
