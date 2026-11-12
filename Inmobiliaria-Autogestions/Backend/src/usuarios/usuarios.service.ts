import { Injectable, BadRequestException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
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

    // 2. Validar que la fecha de nacimiento sea obligatoria y que el usuario sea mayor o igual a 18 años
    if (!fecha_nacimiento) {
      throw new BadRequestException('La fecha de nacimiento es obligatoria.');
    }

    const birthDate = new Date(fecha_nacimiento);
    if (isNaN(birthDate.getTime())) {
      throw new BadRequestException('La fecha de nacimiento no es válida.');
    }

    const hoy = new Date();
    let edad = hoy.getFullYear() - birthDate.getFullYear();
    const mes = hoy.getMonth() - birthDate.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < birthDate.getDate())) {
      edad--;
    }

    if (edad < 18) {
      throw new BadRequestException('Debes ser mayor o igual de 18 años para poder registrarte en el sistema.');
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

  async getBadges(userId: number) {
    let favoritosCount = 0;
    let notificacionesCount = 0;
    let mensajesCount = 0;
    try {
      const user = await this.prisma.usuario.findUnique({
        where: { id: userId },
        select: { favoritos: true },
      });
      if (user && Array.isArray(user.favoritos)) {
        favoritosCount = (user.favoritos as any[]).length;
      }

      notificacionesCount = await this.prisma.notificacion.count({
        where: {
          leida: false,
          OR: [
            { usuario_id: userId },
            { usuario_id: null, origen: 'sistema' },
          ],
        },
      });

      mensajesCount = await this.prisma.mensaje.count({
        where: {
          leido: false,
          remitente_id: { not: userId },
          chat: {
            OR: [
              { participante1_id: userId },
              { participante2_id: userId },
            ],
          },
        },
      });
    } catch {
      // Ignorar si hay error
    }

    return {
      notificaciones: notificacionesCount,
      mensajes: mensajesCount,
      favoritos: favoritosCount,
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

  // ─── GESTIÓN DE USUARIOS (PANEL ADMINISTRADOR) ────────────────────
  private formatUser(u: any) {
    return {
      id: u.id,
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      telefono: u.telefono,
      ci: u.ci,
      fecha_nacimiento: u.fecha_nacimiento ? u.fecha_nacimiento.toISOString().split('T')[0] : null,
      direccion: u.direccion,
      foto: u.foto,
      rol_id: u.rol_id,
      rol: u.rol_relacion?.nombre || (u.rol_id === 1 ? 'admin' : 'usuario'),
      rol_nombre: u.rol_relacion?.descripcion || (u.rol_id === 1 ? 'Administrador' : 'Usuario'),
      activo: u.activo,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }

  async listarPanel() {
    const usuarios = await this.prisma.usuario.findMany({
      include: { rol_relacion: true },
      orderBy: { id: 'asc' },
    });
    return usuarios.map((u) => this.formatUser(u));
  }

  async getById(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: { rol_relacion: true },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return this.formatUser(usuario);
  }

  async createPanel(dto: any) {
    const emailNormalizado = dto.email.toLowerCase().trim();
    const existe = await this.prisma.usuario.findUnique({ where: { email: emailNormalizado } });
    if (existe) throw new ConflictException('Ya existe un usuario con este correo');

    const rawPassword = dto.password?.trim() || 'password123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const rolNombre = dto.rol === 'admin' ? 'admin' : 'usuario';
    const rol = await this.prisma.rol.findUnique({ where: { nombre: rolNombre } });
    const rolId = rol?.id || (rolNombre === 'admin' ? 1 : 2);

    let birthDate: Date | null = null;
    if (dto.fecha_nacimiento) birthDate = new Date(dto.fecha_nacimiento);

    const nuevo = await this.prisma.usuario.create({
      data: {
        email: emailNormalizado,
        password: hashedPassword,
        first_name: dto.first_name?.trim() || '',
        last_name: dto.last_name?.trim() || '',
        telefono: dto.telefono?.trim() || null,
        ci: dto.ci?.trim() || null,
        fecha_nacimiento: birthDate,
        direccion: dto.direccion?.trim() || null,
        rol_id: rolId,
        activo: dto.activo !== undefined ? dto.activo === true || dto.activo === 'true' : true,
      },
      include: { rol_relacion: true },
    });

    return this.formatUser(nuevo);
  }

  async updatePanel(id: number, dto: any) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const updateData: any = {};
    if (dto.first_name !== undefined) updateData.first_name = dto.first_name.trim();
    if (dto.last_name !== undefined) updateData.last_name = dto.last_name.trim();
    if (dto.email !== undefined) updateData.email = dto.email.toLowerCase().trim();
    if (dto.telefono !== undefined) updateData.telefono = dto.telefono ? dto.telefono.trim() : null;
    if (dto.ci !== undefined) updateData.ci = dto.ci ? dto.ci.trim() : null;
    if (dto.direccion !== undefined) updateData.direccion = dto.direccion ? dto.direccion.trim() : null;
    if (dto.activo !== undefined) updateData.activo = dto.activo === true || dto.activo === 'true';

    if (dto.fecha_nacimiento !== undefined) {
      updateData.fecha_nacimiento = dto.fecha_nacimiento ? new Date(dto.fecha_nacimiento) : null;
    }

    if (dto.password && dto.password.trim() !== '') {
      updateData.password = await bcrypt.hash(dto.password.trim(), 10);
    }

    if (dto.rol) {
      const rolNombre = dto.rol === 'admin' ? 'admin' : 'usuario';
      const rol = await this.prisma.rol.findUnique({ where: { nombre: rolNombre } });
      if (rol) updateData.rol_id = rol.id;
    }

    const actualizado = await this.prisma.usuario.update({
      where: { id },
      data: updateData,
      include: { rol_relacion: true },
    });

    return this.formatUser(actualizado);
  }

  async deletePanel(id: number, currentUserId: number) {
    if (id === currentUserId) {
      throw new BadRequestException('No puedes eliminar tu propia cuenta de administrador');
    }
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    await this.prisma.usuario.delete({ where: { id } });
    return { success: true, message: 'Usuario eliminado correctamente' };
  }

  // ─── HU-19 SISTEMA DE NOTIFICACIONES Y ALERTAS (ZERO CONTACT) ────

  private formatNotificacion(n: any) {
    return {
      id: n.id,
      titulo: n.titulo,
      mensaje: n.mensaje,
      tipo: n.tipo,
      origen: n.origen,
      leida: n.leida,
      usuario_id: n.usuario_id,
      usuario: n.usuario_id,
      creada: n.creada ? n.creada.toISOString() : new Date().toISOString(),
      updatedAt: n.updatedAt,
    };
  }

  async getNotificacionesSistema(userId: number) {
    let notifs = await this.prisma.notificacion.findMany({
      where: {
        origen: 'sistema',
        OR: [
          { usuario_id: userId },
          { usuario_id: null },
        ],
      },
      orderBy: { creada: 'desc' },
    });

    // Auto-seed de bienvenida Zero Contact si está vacío
    if (notifs.length === 0) {
      await this.prisma.notificacion.createMany({
        data: [
          {
            titulo: 'Bienvenido a SAIPI (Zero Contact)',
            mensaje: 'Explora inmuebles mediante recorridos 360°, valida tu documentación con IA y firma contratos digitales con respaldo Blockchain sin necesidad de intermediarios ni desplazamientos presenciales.',
            tipo: 'info',
            origen: 'sistema',
            usuario_id: userId,
            leida: false,
          },
          {
            titulo: 'Verificación Legal con IA Requerida',
            mensaje: 'Para publicar inmuebles o formalizar contratos de alquiler, recuerda cargar tu Cédula de Identidad en el módulo de Verificación Legal.',
            tipo: 'alerta',
            origen: 'sistema',
            usuario_id: userId,
            leida: false,
          },
        ],
      });

      notifs = await this.prisma.notificacion.findMany({
        where: {
          origen: 'sistema',
          OR: [{ usuario_id: userId }, { usuario_id: null }],
        },
        orderBy: { creada: 'desc' },
      });
    }

    return notifs.map((n) => this.formatNotificacion(n));
  }

  async getNotificacionesUsuario(userId: number) {
    let notifs = await this.prisma.notificacion.findMany({
      where: {
        origen: 'usuario',
        usuario_id: userId,
      },
      orderBy: { creada: 'desc' },
    });

    if (notifs.length === 0) {
      await this.prisma.notificacion.create({
        data: {
          titulo: 'Canal Digital Activo',
          mensaje: 'Aquí recibirás alertas cuando un inquilino envíe una solicitud digital de alquiler, un usuario comente tu inmueble o se requiera tu firma electrónica.',
          tipo: 'confirmacion',
          origen: 'usuario',
          usuario_id: userId,
          leida: false,
        },
      });

      notifs = await this.prisma.notificacion.findMany({
        where: {
          origen: 'usuario',
          usuario_id: userId,
        },
        orderBy: { creada: 'desc' },
      });
    }

    return notifs.map((n) => this.formatNotificacion(n));
  }

  async marcarNotificacionesLeidas(userId: number, origen?: string) {
    const whereClause: any = {
      leida: false,
      OR: [
        { usuario_id: userId },
        { usuario_id: null, origen: 'sistema' },
      ],
    };

    if (origen) {
      whereClause.origen = origen;
    }

    await this.prisma.notificacion.updateMany({
      where: whereClause,
      data: { leida: true },
    });

    return { success: true, message: 'Notificaciones marcadas como leídas' };
  }

  // Métodos reutilizables para emitir notificaciones desde cualquier módulo
  async crearNotificacion(data: {
    usuario_id?: number;
    titulo: string;
    mensaje: string;
    tipo?: string;
    origen?: string;
  }) {
    const nueva = await this.prisma.notificacion.create({
      data: {
        usuario_id: data.usuario_id || null,
        titulo: data.titulo,
        mensaje: data.mensaje,
        tipo: data.tipo || 'info',
        origen: data.origen || 'sistema',
        leida: false,
      },
    });
    return this.formatNotificacion(nueva);
  }

  // CRUD Notificaciones para el Panel Administrador
  async listarNotificacionesPanel() {
    const notifs = await this.prisma.notificacion.findMany({
      orderBy: { id: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    return notifs.map((n) => ({
      ...this.formatNotificacion(n),
      usuario_nombre: n.usuario ? `${n.usuario.first_name} ${n.usuario.last_name}` : 'Todos (Global)',
    }));
  }

  async crearNotificacionPanel(dto: any) {
    if (!dto.titulo || !dto.mensaje) {
      throw new BadRequestException('El título y el mensaje son requeridos');
    }

    const nueva = await this.prisma.notificacion.create({
      data: {
        titulo: dto.titulo.trim(),
        mensaje: dto.mensaje.trim(),
        tipo: dto.tipo || 'info',
        origen: 'sistema',
        leida: dto.leida === true || dto.leida === 'true',
        usuario_id: dto.usuario ? Number(dto.usuario) : null,
      },
    });

    return this.formatNotificacion(nueva);
  }

  async updateNotificacionPanel(id: number, dto: any) {
    const existe = await this.prisma.notificacion.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException('Notificación no encontrada');

    const updateData: any = {};
    if (dto.titulo !== undefined) updateData.titulo = dto.titulo.trim();
    if (dto.mensaje !== undefined) updateData.mensaje = dto.mensaje.trim();
    if (dto.tipo !== undefined) updateData.tipo = dto.tipo;
    if (dto.leida !== undefined) updateData.leida = dto.leida === true || dto.leida === 'true';
    if (dto.usuario !== undefined) updateData.usuario_id = dto.usuario ? Number(dto.usuario) : null;

    const actualizada = await this.prisma.notificacion.update({
      where: { id },
      data: updateData,
    });

    return this.formatNotificacion(actualizada);
  }

  async deleteNotificacionPanel(id: number) {
    const existe = await this.prisma.notificacion.findUnique({ where: { id } });
    if (!existe) throw new NotFoundException('Notificación no encontrada');

    await this.prisma.notificacion.delete({ where: { id } });
    return { success: true, message: 'Notificación eliminada correctamente' };
  }

  // ─── HU-23 SISTEMA DE RESEÑAS Y COMENTARIOS ──────────────────────
  async listarResenas(inmuebleId?: number) {
    const where: any = {};
    if (inmuebleId) {
      where.inmueble_id = Number(inmuebleId);
    }

    const resenas = await this.prisma.resena.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            foto: true,
          },
        },
        inmueble: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return resenas.map((r) => ({
      id: r.id,
      calificacion: r.calificacion,
      comentario: r.comentario,
      inmueble: r.inmueble_id,
      inmueble_titulo: r.inmueble?.titulo,
      usuario: r.usuario_id,
      usuario_nombre: `${r.usuario.first_name} ${r.usuario.last_name}`.trim(),
      usuario_foto: r.usuario.foto,
      creado: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async obtenerPromedioResenas(inmuebleId: number) {
    const resenas = await this.prisma.resena.findMany({
      where: { inmueble_id: Number(inmuebleId) },
      select: { calificacion: true },
    });

    const total = resenas.length;
    if (total === 0) {
      return {
        promedio: 0,
        total: 0,
        desglose: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const suma = resenas.reduce((acc, curr) => acc + curr.calificacion, 0);
    const promedio = Number((suma / total).toFixed(1));

    const desglose: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    resenas.forEach((r) => {
      if (desglose[r.calificacion] !== undefined) {
        desglose[r.calificacion]++;
      }
    });

    return {
      promedio,
      total,
      desglose,
    };
  }

  async crearOActualizarResena(user: any, dto: any) {
    const inmuebleId = Number(dto.inmueble || dto.inmueble_id);
    const calificacion = Number(dto.calificacion);
    const comentario = dto.comentario ? String(dto.comentario).trim() : null;

    if (!inmuebleId || isNaN(inmuebleId)) {
      throw new BadRequestException('El identificador del inmueble es obligatorio');
    }

    if (!calificacion || isNaN(calificacion) || calificacion < 1 || calificacion > 5) {
      throw new BadRequestException('La calificación debe ser un valor entero entre 1 y 5 estrellas');
    }

    const inmueble = await this.prisma.inmueble.findUnique({
      where: { id: inmuebleId },
      include: { propietario_relacion: true },
    });

    if (!inmueble) {
      throw new NotFoundException('Inmueble no encontrado');
    }

    // Upsert reseña (permite crear o actualizar la opinión existente del usuario)
    const resena = await this.prisma.resena.upsert({
      where: {
        usuario_id_inmueble_id: {
          usuario_id: user.id,
          inmueble_id: inmuebleId,
        },
      },
      update: {
        calificacion,
        comentario,
      },
      create: {
        usuario_id: user.id,
        inmueble_id: inmuebleId,
        calificacion,
        comentario,
      },
      include: {
        usuario: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            foto: true,
          },
        },
      },
    });

    // Notificar al propietario mediante el sistema HU-19 (Cero Contacto)
    if (inmueble.propietario_id && inmueble.propietario_id !== user.id) {
      try {
        const estrellasTxt = '⭐'.repeat(calificacion);
        const autorNombre = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Un inquilino';
        await this.prisma.notificacion.create({
          data: {
            usuario_id: inmueble.propietario_id,
            titulo: `Nueva Reseña Recibida ${estrellasTxt}`,
            mensaje: `${autorNombre} calificó tu inmueble "${inmueble.titulo}" con ${calificacion}/5 estrellas${comentario ? `: "${comentario}"` : '.'}`,
            tipo: 'info',
            origen: 'usuario',
          },
        });
      } catch {
        // Ignorar si falla la notificación
      }
    }

    return {
      id: resena.id,
      calificacion: resena.calificacion,
      comentario: resena.comentario,
      inmueble: resena.inmueble_id,
      usuario: resena.usuario_id,
      usuario_nombre: `${resena.usuario.first_name} ${resena.usuario.last_name}`.trim(),
      usuario_foto: resena.usuario.foto,
      creado: resena.createdAt,
      updatedAt: resena.updatedAt,
    };
  }

  async eliminarResena(id: number, user: any) {
    const resena = await this.prisma.resena.findUnique({
      where: { id },
    });

    if (!resena) {
      throw new NotFoundException('Reseña no encontrada');
    }

    const esAutor = resena.usuario_id === user.id;
    const esAdmin = user.rol === 'admin';

    if (!esAutor && !esAdmin) {
      throw new ForbiddenException('No tienes permisos para eliminar esta reseña');
    }

    await this.prisma.resena.delete({ where: { id } });
    return { success: true, message: 'Reseña eliminada exitosamente' };
  }

  // ─── CHAT Y MENSAJERÍA (HU-30) ────────────────────────────────────
  async listarChats(userId: number) {
    const chats = await this.prisma.chat.findMany({
      where: {
        OR: [
          { participante1_id: userId },
          { participante2_id: userId },
        ],
      },
      include: {
        participante1: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            foto: true,
          },
        },
        participante2: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            foto: true,
          },
        },
        inmueble: {
          select: {
            id: true,
            titulo: true,
            precio: true,
            imagen_principal: true,
            multimedia: true,
          },
        },
        mensajes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const results = await Promise.all(
      chats.map(async (c) => {
        const no_leidos = await this.prisma.mensaje.count({
          where: {
            chat_id: c.id,
            remitente_id: { not: userId },
            leido: false,
          },
        });

        const ultimoMsg = c.mensajes[0] || null;

        return {
          id: c.id,
          inmueble: c.inmueble_id,
          inmueble_titulo: c.inmueble?.titulo || null,
          inmueble_precio: c.inmueble?.precio || null,
          inmueble_foto: c.inmueble?.imagen_principal || (Array.isArray(c.inmueble?.multimedia) ? (c.inmueble.multimedia as any[])[0]?.archivo : null),
          participante1: c.participante1_id,
          participante1_nombre: `${c.participante1?.first_name || ''} ${c.participante1?.last_name || ''}`.trim() || c.participante1?.email || 'Usuario',
          participante1_username: c.participante1?.email?.split('@')[0] || `user-${c.participante1_id}`,
          participante1_foto: c.participante1?.foto || null,
          participante2: c.participante2_id,
          participante2_nombre: `${c.participante2?.first_name || ''} ${c.participante2?.last_name || ''}`.trim() || c.participante2?.email || 'Usuario',
          participante2_username: c.participante2?.email?.split('@')[0] || `user-${c.participante2_id}`,
          participante2_foto: c.participante2?.foto || null,
          ultimo_mensaje: ultimoMsg ? {
            id: ultimoMsg.id,
            contenido: ultimoMsg.contenido,
            tipo: ultimoMsg.tipo,
            remitente: ultimoMsg.remitente_id,
            creado: ultimoMsg.createdAt,
            leido: ultimoMsg.leido,
          } : null,
          fecha_ultimo: ultimoMsg?.createdAt || c.updatedAt,
          no_leidos,
        };
      })
    );

    return results;
  }

  async crearOObtenerChat(userId: number, dto: any) {
    const participante1_id = Number(dto.participante1) || userId;
    const participante2_id = Number(dto.participante2);
    const inmueble_id = dto.inmueble ? Number(dto.inmueble) : null;

    if (!participante2_id) {
      throw new BadRequestException('El participante2 es obligatorio');
    }

    const condition: any = {
      OR: [
        { participante1_id: participante1_id, participante2_id: participante2_id },
        { participante1_id: participante2_id, participante2_id: participante1_id },
      ],
    };

    if (inmueble_id) {
      condition.inmueble_id = inmueble_id;
    }

    let chat = await this.prisma.chat.findFirst({
      where: condition,
      include: {
        participante1: true,
        participante2: true,
        inmueble: true,
        mensajes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!chat) {
      chat = await this.prisma.chat.create({
        data: {
          participante1_id,
          participante2_id,
          inmueble_id,
        },
        include: {
          participante1: true,
          participante2: true,
          inmueble: true,
          mensajes: true,
        },
      });
    }

    const ultimoMsg = chat.mensajes[0] || null;
    return {
      id: chat.id,
      inmueble: chat.inmueble_id,
      inmueble_titulo: chat.inmueble?.titulo || null,
      inmueble_precio: chat.inmueble?.precio || null,
      inmueble_foto: chat.inmueble?.imagen_principal || (Array.isArray(chat.inmueble?.multimedia) ? (chat.inmueble.multimedia as any[])[0]?.archivo : null),
      participante1: chat.participante1_id,
      participante1_nombre: `${chat.participante1?.first_name || ''} ${chat.participante1?.last_name || ''}`.trim() || chat.participante1?.email || 'Usuario',
      participante1_username: chat.participante1?.email?.split('@')[0] || `user-${chat.participante1_id}`,
      participante1_foto: chat.participante1?.foto || null,
      participante2: chat.participante2_id,
      participante2_nombre: `${chat.participante2?.first_name || ''} ${chat.participante2?.last_name || ''}`.trim() || chat.participante2?.email || 'Usuario',
      participante2_username: chat.participante2?.email?.split('@')[0] || `user-${chat.participante2_id}`,
      participante2_foto: chat.participante2?.foto || null,
      ultimo_mensaje: ultimoMsg ? {
        id: ultimoMsg.id,
        contenido: ultimoMsg.contenido,
        tipo: ultimoMsg.tipo,
        remitente: ultimoMsg.remitente_id,
        creado: ultimoMsg.createdAt,
        leido: ultimoMsg.leido,
      } : null,
      fecha_ultimo: ultimoMsg?.createdAt || chat.updatedAt,
      no_leidos: 0,
    };
  }

  async obtenerMensajesChat(chatId: number, userId: number) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat no encontrado');
    }

    // Marcar como leídos los mensajes que no sean del usuario actual
    await this.prisma.mensaje.updateMany({
      where: {
        chat_id: chatId,
        remitente_id: { not: userId },
        leido: false,
      },
      data: { leido: true },
    });

    const mensajes = await this.prisma.mensaje.findMany({
      where: { chat_id: chatId },
      include: {
        remitente: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            foto: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return mensajes.map((m) => ({
      id: m.id,
      chat: m.chat_id,
      remitente: m.remitente_id,
      remitente_nombre: `${m.remitente?.first_name || ''} ${m.remitente?.last_name || ''}`.trim() || m.remitente?.email || 'Usuario',
      remitente_foto: m.remitente?.foto || null,
      tipo: m.tipo,
      contenido: m.contenido,
      archivo: m.archivo_url,
      archivo_url: m.archivo_url,
      ubicacion: m.tipo === 'ubicacion' ? m.contenido : null,
      leido: m.leido,
      creado: m.createdAt,
      createdAt: m.createdAt,
    }));
  }

  async enviarMensaje(userId: number, dto: any, file?: Express.Multer.File) {
    const chatId = Number(dto.chat);
    if (!chatId) {
      throw new BadRequestException('El campo chat es obligatorio');
    }

    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { participante1: true, participante2: true },
    });

    if (!chat) {
      throw new NotFoundException('Chat no encontrado');
    }

    // Verificar si hay bloqueo entre las partes
    const otroParticipanteId = chat.participante1_id === userId ? chat.participante2_id : chat.participante1_id;
    const bloqueo = await this.prisma.bloqueoUsuario.findFirst({
      where: {
        OR: [
          { usuario_id: userId, bloqueado_id: otroParticipanteId },
          { usuario_id: otroParticipanteId, bloqueado_id: userId },
        ],
      },
    });

    if (bloqueo) {
      throw new ForbiddenException('No se puede enviar mensajes debido a un bloqueo activo entre las partes');
    }

    let archivoUrl: string | null = null;
    if (file) {
      archivoUrl = `http://localhost:3000/uploads/chat/${file.filename}`;
    }

    let tipo = dto.tipo || 'texto';
    if (file && !dto.tipo) {
      tipo = file.mimetype.startsWith('video/') ? 'video' : 'imagen';
    }

    const contenido = dto.ubicacion ? dto.ubicacion : (dto.contenido || (file ? file.originalname : ''));

    const mensaje = await this.prisma.mensaje.create({
      data: {
        chat_id: chatId,
        remitente_id: userId,
        tipo,
        contenido,
        archivo_url: archivoUrl,
        leido: false,
      },
      include: {
        remitente: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            foto: true,
            email: true,
          },
        },
      },
    });

    await this.prisma.chat.update({
      where: { id: chatId },
      data: {
        ultimo_mensaje: contenido,
        fecha_ultimo: mensaje.createdAt,
      },
    });

    // Notificar al otro participante
    try {
      const remitenteNombre = `${mensaje.remitente?.first_name || ''} ${mensaje.remitente?.last_name || ''}`.trim() || 'Nuevo mensaje';
      await this.prisma.notificacion.create({
        data: {
          usuario_id: otroParticipanteId,
          titulo: `Mensaje de ${remitenteNombre}`,
          mensaje: tipo === 'texto' ? (contenido.length > 60 ? contenido.substring(0, 57) + '...' : contenido) : `Te ha enviado un adjunto (${tipo})`,
          tipo: 'mensaje',
          origen: 'usuario',
        },
      });
    } catch {
      // Ignorar fallo de notificación
    }

    return {
      id: mensaje.id,
      chat: mensaje.chat_id,
      remitente: mensaje.remitente_id,
      remitente_nombre: `${mensaje.remitente?.first_name || ''} ${mensaje.remitente?.last_name || ''}`.trim() || mensaje.remitente?.email || 'Usuario',
      remitente_foto: mensaje.remitente?.foto || null,
      tipo: mensaje.tipo,
      contenido: mensaje.contenido,
      archivo: mensaje.archivo_url,
      archivo_url: mensaje.archivo_url,
      ubicacion: mensaje.tipo === 'ubicacion' ? mensaje.contenido : null,
      leido: mensaje.leido,
      creado: mensaje.createdAt,
      createdAt: mensaje.createdAt,
    };
  }

  async eliminarMensaje(id: number, userId: number) {
    const msg = await this.prisma.mensaje.findUnique({ where: { id } });
    if (!msg) throw new NotFoundException('Mensaje no encontrado');
    if (msg.remitente_id !== userId) throw new ForbiddenException('Solo puedes eliminar tus propios mensajes');
    await this.prisma.mensaje.delete({ where: { id } });
    return { success: true, message: 'Mensaje eliminado' };
  }

  async checkBloqueo(userId: number, targetUserId: number) {
    const bloqueadoPorMi = await this.prisma.bloqueoUsuario.findUnique({
      where: {
        usuario_id_bloqueado_id: {
          usuario_id: userId,
          bloqueado_id: targetUserId,
        },
      },
    });

    const meBloqueo = await this.prisma.bloqueoUsuario.findUnique({
      where: {
        usuario_id_bloqueado_id: {
          usuario_id: targetUserId,
          bloqueado_id: userId,
        },
      },
    });

    return {
      bloqueado_por_mi: !!bloqueadoPorMi,
      me_bloqueo: !!meBloqueo,
    };
  }

  async toggleBloqueo(userId: number, targetUserId: number) {
    if (userId === targetUserId) {
      throw new BadRequestException('No puedes bloquearte a ti mismo');
    }

    const existente = await this.prisma.bloqueoUsuario.findUnique({
      where: {
        usuario_id_bloqueado_id: {
          usuario_id: userId,
          bloqueado_id: targetUserId,
        },
      },
    });

    if (existente) {
      await this.prisma.bloqueoUsuario.delete({
        where: { id: existente.id },
      });
      return {
        success: true,
        bloqueado: false,
        message: 'Usuario desbloqueado exitosamente',
      };
    } else {
      await this.prisma.bloqueoUsuario.create({
        data: {
          usuario_id: userId,
          bloqueado_id: targetUserId,
        },
      });
      return {
        success: true,
        bloqueado: true,
        message: 'Usuario bloqueado exitosamente',
      };
    }
  }
}
