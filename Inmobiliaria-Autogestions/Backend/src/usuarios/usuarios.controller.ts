import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UsuariosService } from './usuarios.service';
import { RegistroDto } from './dto/registro.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}
