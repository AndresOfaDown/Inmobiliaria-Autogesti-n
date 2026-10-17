import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario, RolUsuario } from './entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usersRepository: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async register(data: {
    email: string;
    password: string;
    nombre: string;
    apellido?: string;
    rol?: RolUsuario;
    telefono?: string;
    ci?: string;
    direccion?: string;
  }) {
    const existing = await this.usersRepository.findOne({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('El correo electrónico ya se encuentra registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.usersRepository.create({
      email: data.email.toLowerCase(),
      password: hashedPassword,
      nombre: data.nombre,
      apellido: data.apellido || '',
      rol: data.rol || RolUsuario.USUARIO,
      telefono: data.telefono || '',
      ci: data.ci || '',
      direccion: data.direccion || '',
      activo: true,
    });

    const saved = await this.usersRepository.save(user);
    const token = this.generateToken(saved);

    const { password, ...userWithoutPassword } = saved;
    return {
      user: userWithoutPassword,
      accessToken: token,
    };
  }

  async login(email: string, pass: string) {
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const match = await bcrypt.compare(pass, user.password);
    if (!match) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Tu cuenta ha sido desactivada');
    }

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken: token,
    };
  }

  private generateToken(user: Usuario): string {
    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
    };
    return this.jwtService.sign(payload);
  }
}
