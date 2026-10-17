import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EstadoCita } from './entities/cita.entity';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // Tipos
  @Get('tipos')
  getTipos() {
    return this.propertiesService.getTiposInmueble();
  }

  @Post('tipos')
  createTipo(@Body() body: { nombre: string; descripcion?: string }) {
    return this.propertiesService.createTipoInmueble(body.nombre, body.descripcion);
  }

  // Explorar / Búsqueda
  @Get('search')
  search(@Query() query: any) {
    return this.propertiesService.searchProperties({
      tipoId: query.tipoId,
      tipoOferta: query.tipoOferta,
      ciudad: query.ciudad,
      zona: query.zona,
      precioMin: query.precioMin ? parseFloat(query.precioMin) : undefined,
      precioMax: query.precioMax ? parseFloat(query.precioMax) : undefined,
      habitaciones: query.habitaciones ? parseInt(query.habitaciones, 10) : undefined,
      banos: query.banos ? parseInt(query.banos, 10) : undefined,
      garaje: query.garaje !== undefined ? query.garaje === 'true' : undefined,
      search: query.search,
    });
  }

  // Mis inmuebles (Propietario)
  @UseGuards(JwtAuthGuard)
  @Get('owner/my-properties')
  getMyProperties(@CurrentUser() user: any) {
    return this.propertiesService.getPropertiesByOwner(user.id);
  }

  // Detalle público
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.propertiesService.getPropertyById(id);
  }

  // Crear inmueble
  @UseGuards(JwtAuthGuard)
  @Post()
  createProperty(@CurrentUser() user: any, @Body() data: any) {
    return this.propertiesService.createProperty(user.id, data);
  }

  // Actualizar inmueble
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateProperty(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() data: any,
  ) {
    return this.propertiesService.updateProperty(id, user.id, data);
  }

  // Eliminar inmueble
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteProperty(@Param('id') id: string, @CurrentUser() user: any) {
    return this.propertiesService.deleteProperty(id, user.id);
  }

  // Multimedia
  @UseGuards(JwtAuthGuard)
  @Post(':id/multimedia')
  addMultimedia(@Param('id') id: string, @Body() body: { items: any[] }) {
    return this.propertiesService.addMultimedia(id, body.items);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('multimedia/:mediaId')
  deleteMultimedia(@Param('mediaId') mediaId: string) {
    return this.propertiesService.deleteMultimedia(mediaId);
  }

  // Hotspots
  @UseGuards(JwtAuthGuard)
  @Post('hotspots')
  addHotspot(@Body() data: any) {
    return this.propertiesService.addHotspot(data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('hotspots/:id')
  deleteHotspot(@Param('id') id: string) {
    return this.propertiesService.deleteHotspot(id);
  }

  // Verificación Legal (OCR + IA + Blockchain)
  @UseGuards(JwtAuthGuard)
  @Post(':id/verificar-titulo')
  verifyTitle(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { archivoTituloUrl: string; textoOcr?: string },
  ) {
    return this.propertiesService.requestTitleVerification(
      id,
      user.id,
      body.archivoTituloUrl,
      body.textoOcr,
    );
  }

  // Citas / Visitas
  @UseGuards(JwtAuthGuard)
  @Post('citas')
  requestAppointment(@CurrentUser() user: any, @Body() data: any) {
    return this.propertiesService.requestAppointment(user.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('citas/my-appointments')
  getMyAppointments(@CurrentUser() user: any) {
    return this.propertiesService.getAppointmentsForUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('citas/:id/status')
  updateAppointmentStatus(
    @Param('id') id: string,
    @Body() body: { estado: EstadoCita },
  ) {
    return this.propertiesService.updateAppointmentStatus(id, body.estado);
  }

  // Favoritos
  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  toggleFavorite(@Param('id') id: string, @CurrentUser() user: any) {
    return this.propertiesService.toggleFavorite(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites/list')
  getFavorites(@CurrentUser() user: any) {
    return this.propertiesService.getFavorites(user.id);
  }
}
