import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegistroDto } from './dto/registro.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async registro(registroDto: RegistroDto) {
    const { email, password, first_name, last_name, telefono, ci, fecha_nacimiento, direccion } = registroDto;

    const emailNormalizado = email.toLowerCase().trim();

    // 1. Validar unicidad del correo
    const existeUsuario = await this.prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (existeUsuario) {
      throw new ConflictException('Ya existe un usuario registrado con este correo electrónico.');
    }

    // 2. Validar edad (mayor de 18 años) si se proporciona fecha de nacimiento
    let birthDate: Date | null = null;
    if (fecha_nacimiento) {
      birthDate = new Date(fecha_nacimiento);
      const hoy = new Date();
      let edad = hoy.getFullYear() - birthDate.getFullYear();
      const mes = hoy.getMonth() - birthDate.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < birthDate.getDate())) {
        edad--;
      }
      if (edad < 18) {
        throw new BadRequestException('Debes ser mayor de 18 años para poder registrarte.');
      }
    }

    // 3. Obtener el rol 'usuario' por defecto
    let rolUsuario = await this.prisma.rol.findUnique({
      where: { nombre: 'usuario' },
    });

    if (!rolUsuario) {
      rolUsuario = await this.prisma.rol.create({
        data: {
          id: 2,
          nombre: 'usuario',
          descripcion: 'Usuario',
        },
      });
    }

    // 4. Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Crear usuario en la base de datos asociado al rol
    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        email: emailNormalizado,
        password: hashedPassword,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        telefono: telefono ? telefono.trim() : null,
        ci: ci ? ci.trim() : null,
        fecha_nacimiento: birthDate,
        direccion: direccion ? direccion.trim() : null,
        rol_id: rolUsuario.id,
        activo: true,
      },
      include: {
        rol_relacion: true,
      },
    });

    return {
      message: '¡Registro exitoso! Ya puedes iniciar sesión con tu cuenta.',
      user: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        first_name: nuevoUsuario.first_name,
        last_name: nuevoUsuario.last_name,
        telefono: nuevoUsuario.telefono,
        ci: nuevoUsuario.ci,
        fecha_nacimiento: nuevoUsuario.fecha_nacimiento,
        direccion: nuevoUsuario.direccion,
        foto: nuevoUsuario.foto,
        rol_id: nuevoUsuario.rol_id,
        rol: nuevoUsuario.rol_relacion.nombre,
        rol_nombre: nuevoUsuario.rol_relacion.descripcion,
        createdAt: nuevoUsuario.createdAt,
      },
    };
  }

  async getPerfil(userId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        rol_relacion: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: usuario.id,
      email: usuario.email,
      first_name: usuario.first_name,
      last_name: usuario.last_name,
      telefono: usuario.telefono,
      ci: usuario.ci,
      fecha_nacimiento: usuario.fecha_nacimiento,
      direccion: usuario.direccion,
      foto: usuario.foto,
      rol_id: usuario.rol_id,
      rol: usuario.rol_relacion?.nombre || 'usuario',
      rol_nombre: usuario.rol_relacion?.descripcion || 'Usuario',
      activo: usuario.activo,
    };
  }

  async updatePerfil(userId: number, updateDto: UpdatePerfilDto, file?: Express.Multer.File) {
    const dataToUpdate: any = {};

    // 1. Campos editables por el usuario (CU02): Teléfono y Dirección
    if (updateDto.telefono !== undefined) {
      dataToUpdate.telefono = updateDto.telefono ? updateDto.telefono.trim() : null;
    }
    if (updateDto.direccion !== undefined) {
      dataToUpdate.direccion = updateDto.direccion ? updateDto.direccion.trim() : null;
    }

    // 2. Foto de perfil: si se sube archivo multimedia o URL
    if (file) {
      dataToUpdate.foto = `http://localhost:3000/uploads/avatars/${file.filename}`;
    } else if (updateDto.foto !== undefined && typeof updateDto.foto === 'string') {
      dataToUpdate.foto = updateDto.foto.trim() || null;
    }

    // 3. Regla de Negocio (CU02):
    // first_name, last_name, ci, fecha_nacimiento, email y rol son INMUTABLES.

    const usuario = await this.prisma.usuario.update({
      where: { id: userId },
      data: dataToUpdate,
      include: {
        rol_relacion: true,
      },
    });

    return {
      id: usuario.id,
      email: usuario.email,
      first_name: usuario.first_name,
      last_name: usuario.last_name,
      telefono: usuario.telefono,
      ci: usuario.ci,
      fecha_nacimiento: usuario.fecha_nacimiento,
      direccion: usuario.direccion,
      foto: usuario.foto,
      rol_id: usuario.rol_id,
      rol: usuario.rol_relacion?.nombre || 'usuario',
      rol_nombre: usuario.rol_relacion?.descripcion || 'Usuario',
      activo: usuario.activo,
    };
  }
}
