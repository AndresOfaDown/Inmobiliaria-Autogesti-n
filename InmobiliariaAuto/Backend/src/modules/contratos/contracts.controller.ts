import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get('tipos')
  getTipos() {
    return this.contractsService.getTiposContrato();
  }

  @Post('tipos')
  createTipo(@Body() body: { nombre: string; descripcion?: string }) {
    return this.contractsService.createTipoContrato(body.nombre, body.descripcion);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-contracts')
  getMyContracts(@CurrentUser() user: any) {
    return this.contractsService.getMyContracts(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  getAllContracts() {
    return this.contractsService.getAllContracts();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getContractById(@Param('id') id: string) {
    return this.contractsService.getContractById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createContract(@Body() data: any) {
    return this.contractsService.createContract(data);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/sign')
  signContract(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { firmaBase64: string },
  ) {
    return this.contractsService.signContract(id, user.id, body.firmaBase64);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reject')
  rejectContract(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { motivo: string },
  ) {
    return this.contractsService.rejectContract(id, user.id, body.motivo);
  }
}
