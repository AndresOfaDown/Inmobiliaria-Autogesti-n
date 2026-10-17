import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { InmueblesService } from './inmuebles.service';
import { CreateInmuebleDto } from './dto/create-inmueble.dto';
import { UpdateInmuebleDto } from './dto/update-inmueble.dto';
import { FilterInmueblesDto } from './dto/filter-inmuebles.dto';
import { CreatePublicacionDto, UpdatePublicacionDto } from './dto/create-publicacion.dto';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { CreateTipoDto, UpdateTipoDto } from './dto/create-tipo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('inmuebles')
export class InmueblesController {
  constructor(private readonly inmueblesService: InmueblesService) {}

  // ─── CATÁLOGO PÚBLICO (Solo inmuebles en estado 'disponible' o 'publicado') ──
  @UseGuards(OptionalJwtAuthGuard)
  @Get('lista')
  listarPublico(@Query() filters: FilterInmueblesDto, @Request() req: any) {
    return this.inmueblesService.listarCatalogoPublico(filters, req.user?.id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('lista/:id')
  getByIdPublico(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.inmueblesService.getById(id, req.user);
  }

  // Rutas alternativas para crear / actualizar desde el servicio
  @UseGuards(JwtAuthGuard)
  @Post('lista')
  createInmueble(@Body() dto: CreateInmuebleDto, @Request() req: any) {
    return this.inmueblesService.create(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put('lista/:id')
  updateInmueblePut(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInmuebleDto, @Request() req: any) {
    return this.inmueblesService.update(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('lista/:id')
  updateInmueblePatch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInmuebleDto, @Request() req: any) {
    return this.inmueblesService.update(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('lista/:id')
  deleteInmueble(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.inmueblesService.remove(id, req.user);
  }

  // ─── PANEL ADMINISTRATIVO / MIS INMUEBLES ────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('panel/lista')
  listarPanel(@Query('personal') personal: string, @Request() req: any) {
    const isPersonal = personal === 'true';
    return this.inmueblesService.listarPanel(req.user, isPersonal);
  }

  @UseGuards(JwtAuthGuard)
  @Post('panel/lista')
  createPanel(@Body() dto: CreateInmuebleDto, @Request() req: any) {
    return this.inmueblesService.create(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put('panel/lista/:id')
  updatePanelPut(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInmuebleDto, @Request() req: any) {
    return this.inmueblesService.update(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('panel/lista/:id')
  updatePanelPatch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInmuebleDto, @Request() req: any) {
    return this.inmueblesService.update(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('panel/lista/:id')
  deletePanel(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.inmueblesService.remove(id, req.user);
  }

  // ─── CATEGORÍAS / TIPOS DE INMUEBLE ──────────────────────────────
  @Get('tipos')
  listarTiposPublico() {
    return this.inmueblesService.listarTipos();
  }

  @Get('panel/tipos')
  listarTiposPanel() {
    return this.inmueblesService.listarTipos();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('panel/tipos')
  crearTipo(@Body() dto: CreateTipoDto) {
    return this.inmueblesService.crearTipo(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('panel/tipos/:id')
  actualizarTipoPut(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTipoDto) {
    return this.inmueblesService.actualizarTipo(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('panel/tipos/:id')
  actualizarTipoPatch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTipoDto) {
    return this.inmueblesService.actualizarTipo(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('panel/tipos/:id')
  eliminarTipo(@Param('id', ParseIntPipe) id: number) {
    return this.inmueblesService.eliminarTipo(id);
  }

  // ─── MULTIMEDIA (Fotos, Videos, Panorámicas 360°, Audio) ─────────
  @UseGuards(JwtAuthGuard)
  @Post('multimedia')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'inmuebles'),
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `inmueble-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB max
      },
    }),
  )
  uploadMultimedia(
    @UploadedFile() file: Express.Multer.File,
    @Body('inmueble') inmuebleId: string,
    @Body('tipo') tipo: string,
    @Body('principal') principal: string,
    @Body('descripcion') descripcion: string,
    @Request() req: any,
  ) {
    const isPrincipal = principal === 'true';
    return this.inmueblesService.uploadMultimedia(
      Number(inmuebleId),
      file,
      tipo,
      isPrincipal,
      descripcion,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('multimedia/:id')
  deleteMultimedia(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.inmueblesService.deleteMultimedia(id, req.user);
  }

  // ─── PUBLICACIONES DE INMUEBLE (Ofertas de Alquiler / Venta) ─────
  @UseGuards(JwtAuthGuard)
  @Get('panel/publicaciones')
  listarPublicaciones(@Query('inmueble', ParseIntPipe) inmuebleId: number) {
    return this.inmueblesService.listarPublicaciones(inmuebleId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('panel/publicaciones')
  crearPublicacion(@Body() dto: CreatePublicacionDto, @Request() req: any) {
    return this.inmueblesService.crearPublicacion(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('panel/publicaciones/:id')
  cambiarEstadoPublicacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePublicacionDto,
    @Request() req: any,
  ) {
    return this.inmueblesService.cambiarEstadoPublicacion(id, dto, req.user);
  }

  // ─── HORARIOS DE VISITAS ──────────────────────────────────────────
  @Get('horarios')
  listarHorarios(@Query('inmueble', ParseIntPipe) inmuebleId: number) {
    return this.inmueblesService.listarHorarios(inmuebleId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('horarios')
  crearHorario(@Body() dto: CreateHorarioDto, @Request() req: any) {
    return this.inmueblesService.crearHorario(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('horarios/:id')
  eliminarHorario(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.inmueblesService.eliminarHorario(id, req.user);
  }

  // ─── FAVORITOS (CU9) ─────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('favoritos')
  listarFavoritos(@Request() req: any) {
    return this.inmueblesService.listarFavoritos(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('favoritos/toggle')
  @HttpCode(HttpStatus.OK)
  toggleFavorito(@Body('inmueble', ParseIntPipe) inmuebleId: number, @Request() req: any) {
    return this.inmueblesService.toggleFavorito(inmuebleId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('favoritos/:id')
  eliminarFavorito(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.inmueblesService.eliminarFavorito(id, req.user.id);
  }

  // ─── CHEQUEO DE ACCESO 360 / VR ───────────────────────────────────
  @UseGuards(OptionalJwtAuthGuard)
  @Get('accesos-360/check')
  checkAcceso360(@Query('inmueble_id', ParseIntPipe) inmuebleId: number, @Request() req: any) {
    return this.inmueblesService.checkAcceso360(inmuebleId, req.user);
  }
}
