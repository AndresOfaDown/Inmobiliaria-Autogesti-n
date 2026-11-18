import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UsuariosService } from './usuarios.service';
import { RegistroDto } from './dto/registro.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  registro(@Body() registroDto: RegistroDto) {
    return this.usuariosService.registro(registroDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('lista/me')
  getPerfil(@Request() req: any) {
    return this.usuariosService.getPerfil(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(['lista/badges', 'lista/badges/'])
  getBadges(@Request() req: any) {
    return this.usuariosService.getBadges(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('lista/me')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'avatars'),
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // Máximo 5MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/i)) {
          return callback(
            new BadRequestException('Solo se permiten archivos de imagen (jpg, jpeg, png, webp, gif)'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  updatePerfil(
    @Request() req: any,
    @Body() updateDto: UpdatePerfilDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usuariosService.updatePerfil(req.user.id, updateDto, file);
  }

  // ─── GESTIÓN DE USUARIOS (PANEL ADMINISTRADOR) ────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(['panel/lista', 'panel/lista/', 'lista', 'lista/'])
  listarPanel() {
    return this.usuariosService.listarPanel();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('panel/lista/:id')
  getByIdPanel(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.getById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('panel/lista')
  createPanel(@Body() dto: any) {
    return this.usuariosService.createPanel(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('panel/lista/:id')
  updatePanelPut(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.usuariosService.updatePanel(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('panel/lista/:id')
  updatePanelPatch(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.usuariosService.updatePanel(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('panel/lista/:id')
  deletePanel(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.usuariosService.deletePanel(id, req.user.id);
  }

  // ─── HU-19 NOTIFICACIONES Y ALERTAS (USUARIO) ─────────────────────
  @UseGuards(JwtAuthGuard)
  @Get(['notificaciones/sistema', 'notificaciones/sistema/'])
  getNotificacionesSistema(@Request() req: any) {
    return this.usuariosService.getNotificacionesSistema(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(['notificaciones/usuario', 'notificaciones/usuario/'])
  getNotificacionesUsuario(@Request() req: any) {
    return this.usuariosService.getNotificacionesUsuario(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(['notificaciones/marcar-leidas', 'notificaciones/marcar-leidas/'])
  marcarNotificacionesLeidas(@Request() req: any, @Body() body: any) {
    return this.usuariosService.marcarNotificacionesLeidas(req.user.id, body?.origen);
  }

  // ─── HU-19 NOTIFICACIONES (PANEL ADMINISTRADOR) ───────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(['panel/notificaciones', 'panel/notificaciones/', 'notificaciones', 'notificaciones/'])
  listarNotificacionesPanel() {
    return this.usuariosService.listarNotificacionesPanel();
  }

  // ─── AGENDA DE VISITAS / EVENTOS (PANEL) ─────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get(['panel/agenda', 'panel/agenda/', 'agenda', 'agenda/'])
  listarAgenda() {
    return [
      { id: 1, titulo: 'Inspección Inmueble Toborochi', descripcion: 'Revisión técnica de cerradura y domótica', fecha_inicio: new Date().toISOString(), completado: true },
      { id: 2, titulo: 'Visita Guiada - Inmueble #5', descripcion: 'Recorrido presencial con inquilino interesado', fecha_inicio: new Date(Date.now() + 86400000).toISOString(), completado: false },
    ];
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(['panel/notificaciones', 'panel/notificaciones/'])
  crearNotificacionPanel(@Body() dto: any) {
    return this.usuariosService.crearNotificacionPanel(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(['panel/notificaciones/:id', 'panel/notificaciones/:id/'])
  updateNotificacionPanelPut(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.usuariosService.updateNotificacionPanel(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(['panel/notificaciones/:id', 'panel/notificaciones/:id/'])
  updateNotificacionPanelPatch(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.usuariosService.updateNotificacionPanel(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(['panel/notificaciones/:id', 'panel/notificaciones/:id/'])
  deleteNotificacionPanel(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.deleteNotificacionPanel(id);
  }

  // ─── HU-23 SISTEMA DE RESEÑAS Y COMENTARIOS ──────────────────────
  @Get(['resenas', 'resenas/'])
  listarResenas(@Query('inmueble') inmuebleId?: string) {
    return this.usuariosService.listarResenas(inmuebleId ? Number(inmuebleId) : undefined);
  }

  @Get(['resenas/promedio/:inmuebleId', 'resenas/promedio/:inmuebleId/'])
  obtenerPromedioResenas(@Param('inmuebleId', ParseIntPipe) inmuebleId: number) {
    return this.usuariosService.obtenerPromedioResenas(inmuebleId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(['resenas', 'resenas/'])
  crearResena(@Request() req: any, @Body() dto: any) {
    return this.usuariosService.crearOActualizarResena(req.user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(['resenas/:id', 'resenas/:id/'])
  actualizarResena(@Request() req: any, @Body() dto: any) {
    return this.usuariosService.crearOActualizarResena(req.user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(['resenas/:id', 'resenas/:id/'])
  eliminarResena(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.usuariosService.eliminarResena(id, req.user);
  }

  // ─── CHAT Y MENSAJERÍA (HU-30) ────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get(['chats', 'chats/'])
  listarChats(@Request() req: any) {
    return this.usuariosService.listarChats(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(['chats', 'chats/'])
  crearChat(@Request() req: any, @Body() dto: any) {
    return this.usuariosService.crearOObtenerChat(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(['chats/:id/mensajes', 'chats/:id/mensajes/'])
  obtenerMensajesChat(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.usuariosService.obtenerMensajesChat(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(['mensajes', 'mensajes/'])
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'chat'),
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `chat-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 25 * 1024 * 1024,
      },
    }),
  )
  enviarMensaje(
    @Request() req: any,
    @Body() dto: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usuariosService.enviarMensaje(req.user.id, dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(['mensajes/:id', 'mensajes/:id/'])
  eliminarMensaje(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.usuariosService.eliminarMensaje(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(['bloqueos/check/:userId', 'bloqueos/check/:userId/'])
  checkBloqueo(@Param('userId', ParseIntPipe) userId: number, @Request() req: any) {
    return this.usuariosService.checkBloqueo(req.user.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(['bloqueos/toggle/:userId', 'bloqueos/toggle/:userId/'])
  toggleBloqueo(@Param('userId', ParseIntPipe) userId: number, @Request() req: any) {
    return this.usuariosService.toggleBloqueo(req.user.id, userId);
  }
}
