import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { rol_relacion: true },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Credenciales incorrectas o usuario inactivo');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const rolNombre = user.rol_relacion?.nombre || 'usuario';
    const rolDescripcion = user.rol_relacion?.descripcion || 'Usuario';

    const payload = {
      sub: user.id,
      email: user.email,
      rol: rolNombre,
    };

    const access = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'clave-secreta-jwt-inmobiliaria-dev-2026',
      expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any,
    });

    const refresh = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'clave-secreta-refresh-inmobiliaria-dev-2026',
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
    });

    return {
      access,
      refresh,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        rol: rolNombre,
        rol_nombre: rolDescripcion,
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refresh, {
        secret: process.env.JWT_REFRESH_SECRET || 'clave-secreta-refresh-inmobiliaria-dev-2026',
      });

      const user = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
        include: { rol_relacion: true },
      });

      if (!user || !user.activo) {
        throw new UnauthorizedException('Usuario no válido o inactivo');
      }

      const rolNombre = user.rol_relacion?.nombre || 'usuario';

      const newPayload = {
        sub: user.id,
        email: user.email,
        rol: rolNombre,
      };

      const access = this.jwtService.sign(newPayload, {
        secret: process.env.JWT_SECRET || 'clave-secreta-jwt-inmobiliaria-dev-2026',
        expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any,
      });

      return { access };
    } catch {
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }
  }
}
