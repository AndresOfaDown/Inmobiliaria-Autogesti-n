import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'clave-secreta-jwt-inmobiliaria-dev-2026',
    });
  }

  async validate(payload: { sub: number; email: string; rol: string }) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: { rol_relacion: true },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      telefono: user.telefono,
      ci: user.ci,
      fecha_nacimiento: user.fecha_nacimiento,
      direccion: user.direccion,
      foto: user.foto,
      rol_id: user.rol_id,
      rol: user.rol_relacion?.nombre || 'usuario',
      rol_nombre: user.rol_relacion?.descripcion || 'Usuario',
      activo: user.activo,
    };
  }
}
