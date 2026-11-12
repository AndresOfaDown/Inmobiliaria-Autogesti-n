import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDispositivoDto } from './dto/create-dispositivo.dto';
import { AccionDispositivoDto } from './dto/accion-dispositivo.dto';
import { CreateReglaAccesoDto } from './dto/create-regla.dto';

@Injectable()
export class IotService {
  constructor(private prisma: PrismaService) {}

  // ─── LISTAR DISPOSITIVOS DE UN INMUEBLE (Para Propietario / Admin) ─
  async listarPorInmueble(inmuebleId: number, user: any) {
    const inm = await this.prisma.inmueble.findUnique({
      where: { id: inmuebleId },
    });
    if (!inm) throw new NotFoundException('Inmueble no encontrado');

    const esPropietario = inm.propietario_id === user.id;
    const esAdmin = user.rol === 'admin';
    if (!esPropietario && !esAdmin) {
      throw new ForbiddenException('No tienes permisos para ver los dispositivos de este inmueble');
    }

    return this.prisma.dispositivoIoT.findMany({
      where: { inmueble_id: inmuebleId },
      include: {
        reglas_acceso: {
          where: { estado: 'activo' },
          include: {
            usuario: {
              select: { id: true, first_name: true, last_name: true, email: true },
            },
            contrato: {
              select: { id: true, smart_contract_id: true, estado: true },
            },
          },
        },
        _count: {
          select: { historial_acciones: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── OBTENER UN DISPOSITIVO ───────────────────────────────────────
  async obtener(id: number, user: any) {
    const dev = await this.prisma.dispositivoIoT.findUnique({
      where: { id },
      include: {
        inmueble: true,
        reglas_acceso: {
          include: {
            usuario: {
              select: { id: true, first_name: true, last_name: true, email: true },
            },
            contrato: true,
          },
        },
        historial_acciones: {
          take: 15,
          orderBy: { createdAt: 'desc' },
          include: {
            usuario: {
              select: { id: true, first_name: true, last_name: true, email: true },
            },
          },
        },
      },
    });

    if (!dev) throw new NotFoundException('Dispositivo no encontrado');

    const esPropietario = dev.inmueble.propietario_id === user.id;
    const esAdmin = user.rol === 'admin';
    const tieneRegla = dev.reglas_acceso.some((r) => r.usuario_id === user.id && r.estado === 'activo');

    if (!esPropietario && !esAdmin && !tieneRegla) {
      throw new ForbiddenException('No tienes permisos para inspeccionar este dispositivo');
    }

    return dev;
  }

  // ─── CREAR DISPOSITIVO IOT (Solo Propietario o Admin) ──────────────
  async crearDispositivo(dto: CreateDispositivoDto, user: any) {
    const inm = await this.prisma.inmueble.findUnique({
      where: { id: dto.inmueble_id },
    });
    if (!inm) throw new NotFoundException('Inmueble no encontrado');

    const esPropietario = inm.propietario_id === user.id;
    const esAdmin = user.rol === 'admin';
    if (!esPropietario && !esAdmin) {
      throw new ForbiddenException('Solo el propietario puede registrar dispositivos en este inmueble');
    }

    // Verificar serial único
    const existeSerial = await this.prisma.dispositivoIoT.findUnique({
      where: { serial_id: dto.serial_id },
    });
    if (existeSerial) {
      throw new BadRequestException(`El número de serie "${dto.serial_id}" ya está registrado en el sistema`);
    }

    const nuevo = await this.prisma.dispositivoIoT.create({
      data: {
        inmueble_id: dto.inmueble_id,
        nombre: dto.nombre,
        tipo: dto.tipo || 'cerradura',
        serial_id: dto.serial_id,
        marca: dto.marca || 'Yale SmartLock',
        modelo: dto.modelo || 'Pro 2026',
        ubicacion: dto.ubicacion || 'Puerta Principal',
        codigo_maestro: dto.codigo_maestro || '123456',
        estado_conexion: 'online',
        bateria: 95,
        bloqueado: true,
      },
    });

    // Registrar en historial evento de instalación
    await this.prisma.historialAccionIoT.create({
      data: {
        dispositivo_id: nuevo.id,
        usuario_id: user.id,
        accion: 'alta_dispositivo',
        metodo: 'app',
        resultado: 'exitoso',
        detalles: `Dispositivo registrado por el propietario ${user.first_name} ${user.last_name}`,
      },
    });

    return nuevo;
  }

  // ─── ACTUALIZAR DISPOSITIVO ───────────────────────────────────────
  async actualizarDispositivo(id: number, data: any, user: any) {
    const dev = await this.prisma.dispositivoIoT.findUnique({
      where: { id },
      include: { inmueble: true },
    });
    if (!dev) throw new NotFoundException('Dispositivo no encontrado');

    const esPropietario = dev.inmueble.propietario_id === user.id;
    const esAdmin = user.rol === 'admin';
    if (!esPropietario && !esAdmin) {
      throw new ForbiddenException('No tienes permisos para modificar este dispositivo');
    }

    return this.prisma.dispositivoIoT.update({
      where: { id },
      data: {
        nombre: data.nombre !== undefined ? data.nombre : dev.nombre,
        ubicacion: data.ubicacion !== undefined ? data.ubicacion : dev.ubicacion,
        codigo_maestro: data.codigo_maestro !== undefined ? data.codigo_maestro : dev.codigo_maestro,
        estado_conexion: data.estado_conexion !== undefined ? data.estado_conexion : dev.estado_conexion,
        bateria: data.bateria !== undefined ? Number(data.bateria) : dev.bateria,
      },
    });
  }

  // ─── ELIMINAR DISPOSITIVO ─────────────────────────────────────────
  async eliminarDispositivo(id: number, user: any) {
    const dev = await this.prisma.dispositivoIoT.findUnique({
      where: { id },
      include: { inmueble: true },
    });
    if (!dev) throw new NotFoundException('Dispositivo no encontrado');

    const esPropietario = dev.inmueble.propietario_id === user.id;
    const esAdmin = user.rol === 'admin';
    if (!esPropietario && !esAdmin) {
      throw new ForbiddenException('No tienes permisos para eliminar este dispositivo');
    }

    await this.prisma.dispositivoIoT.delete({ where: { id } });
    return { success: true, message: 'Dispositivo eliminado correctamente' };
  }

  // ─── MIS LLAVES DIGITALES (Para el Inquilino / Visitante / Propietario) ─
  async obtenerMisLlaves(user: any) {
    const ahora = new Date();

    // 1. Reglas activas donde el usuario es el beneficiario (Inquilino / Visitante)
    const reglas = await this.prisma.reglaAccesoIoT.findMany({
      where: {
        usuario_id: user.id,
        estado: 'activo',
        fecha_inicio: { lte: ahora },
        OR: [
          { fecha_fin: null },
          { fecha_fin: { gte: ahora } },
        ],
      },
      include: {
        dispositivo: {
          include: { inmueble: true },
        },
        contrato: true,
      },
    });

    // 2. Dispositivos donde el usuario es propietario directo
    const dispositivosPropios = await this.prisma.dispositivoIoT.findMany({
      where: {
        inmueble: { propietario_id: user.id },
      },
      include: { inmueble: true },
    });

    const llavesMap = new Map<number, any>();

    // Añadir cerraduras donde es propietario
    for (const d of dispositivosPropios) {
      llavesMap.set(d.id, {
        id: d.id,
        dispositivo_id: d.id,
        nombre: d.nombre,
        tipo: d.tipo,
        marca: d.marca,
        modelo: d.modelo,
        ubicacion: d.ubicacion,
        serial_id: d.serial_id,
        estado_conexion: d.estado_conexion,
        bateria: d.bateria,
        bloqueado: d.bloqueado,
        es_propietario: true,
        rol_acceso: 'Propietario',
        tipo_acceso: 'total_propietario',
        pin_codigo: d.codigo_maestro,
        inmueble_id: d.inmueble_id,
        inmueble_titulo: d.inmueble.titulo,
        inmueble_ciudad: d.inmueble.ciudad,
        fecha_fin: null,
      });
    }

    // Añadir cerraduras autorizadas por regla (inquilino o visitante)
    for (const r of reglas) {
      const d = r.dispositivo;
      if (!d) continue;

      // Si ya está como propietario, tiene precedencia
      if (!llavesMap.has(d.id)) {
        llavesMap.set(d.id, {
          id: d.id,
          dispositivo_id: d.id,
          nombre: d.nombre,
          tipo: d.tipo,
          marca: d.marca,
          modelo: d.modelo,
          ubicacion: d.ubicacion,
          serial_id: d.serial_id,
          estado_conexion: d.estado_conexion,
          bateria: d.bateria,
          bloqueado: d.bloqueado,
          es_propietario: false,
          rol_acceso: r.tipo_acceso === 'contrato' ? 'Inquilino Titular' : 'Visitante Autorizado',
          tipo_acceso: r.tipo_acceso,
          pin_codigo: r.pin_codigo,
          regla_id: r.id,
          contrato_id: r.contrato_id,
          smart_contract_id: r.contrato?.smart_contract_id || null,
          inmueble_id: d.inmueble_id,
          inmueble_titulo: d.inmueble.titulo,
          inmueble_ciudad: d.inmueble.ciudad,
          fecha_inicio: r.fecha_inicio,
          fecha_fin: r.fecha_fin,
        });
      }
    }

    return Array.from(llavesMap.values());
  }

  // ─── CONTROL Y ACCIÓN DIGITAL (ABRIR / CERRAR CERRADURA) ─────────
  async ejecutarAccion(id: number, dto: AccionDispositivoDto, user: any, ip?: string) {
    const dev = await this.prisma.dispositivoIoT.findUnique({
      where: { id },
      include: {
        inmueble: true,
        reglas_acceso: {
          where: { estado: 'activo' },
          include: { contrato: true },
        },
      },
    });

    if (!dev) throw new NotFoundException('Dispositivo no encontrado');

    const esPropietario = dev.inmueble.propietario_id === user.id;
    const esAdmin = user.rol === 'admin';
    const ahora = new Date();

    // Validar privilegios del usuario
    let tienePermiso = esPropietario || esAdmin;
    let reglaAplicada: any = null;

    if (!tienePermiso) {
      reglaAplicada = dev.reglas_acceso.find((r) => {
        if (r.usuario_id !== user.id) return false;
        if (r.fecha_inicio > ahora) return false;
        if (r.fecha_fin && r.fecha_fin < ahora) return false;

        // Si la regla está asociada a un contrato, verificar que el contrato esté ACTIVO
        if (r.contrato_id && r.contrato) {
          if (r.contrato.estado !== 'activo' && r.contrato.estado !== 'enviado') {
            return false;
          }
        }
        return true;
      });

      if (reglaAplicada) {
        tienePermiso = true;
      }
    }

    if (!tienePermiso) {
      // Registrar intento de acceso rechazado
      await this.prisma.historialAccionIoT.create({
        data: {
          dispositivo_id: dev.id,
          usuario_id: user.id,
          accion: dto.accion,
          metodo: dto.metodo || 'app',
          resultado: 'rechazado_por_regla',
          detalles: `Acceso denegado: El usuario ${user.email} no posee una regla de acceso activa ni contrato vigente.`,
          ip: ip || '127.0.0.1',
        },
      });

      throw new ForbiddenException(
        'Acceso denegado: No posees privilegios activos para operar esta cerradura inteligente o tu contrato no está vigente.'
      );
    }

    // ── Ejecutar Acción Solicitada ─────────────────────────────────
    let nuevoEstadoBloqueo = dev.bloqueado;
    let mensajeRespuesta = '';
    let detalleAccion = '';

    if (dto.accion === 'desbloquear') {
      nuevoEstadoBloqueo = false; // Puerta abierta
      mensajeRespuesta = '¡Cerradura desbloqueada con éxito! La puerta está abierta.';
      detalleAccion = `Apertura remota autorizada por ${esPropietario ? 'Propietario' : 'Inquilino'} (${user.first_name} ${user.last_name}).`;
    } else if (dto.accion === 'bloquear') {
      nuevoEstadoBloqueo = true; // Cerrojo echado
      mensajeRespuesta = 'Cerradura bloqueada correctamente. El cerrojo de seguridad está activo.';
      detalleAccion = `Cierre y bloqueo activado por ${user.first_name} ${user.last_name}.`;
    } else if (dto.accion === 'generar_pin') {
      const nuevoPin = Math.floor(100000 + Math.random() * 900000).toString();
      detalleAccion = `PIN temporal generado (${nuevoPin}) para acceso de 24 horas.`;

      // Si existe una regla para este usuario, actualizar su PIN
      if (reglaAplicada) {
        await this.prisma.reglaAccesoIoT.update({
          where: { id: reglaAplicada.id },
          data: { pin_codigo: nuevoPin },
        });
      }

      await this.prisma.historialAccionIoT.create({
        data: {
          dispositivo_id: dev.id,
          usuario_id: user.id,
          accion: 'generar_pin',
          metodo: 'app',
          resultado: 'exitoso',
          detalles: detalleAccion,
          ip: ip || '127.0.0.1',
        },
      });

      return {
        success: true,
        accion: 'generar_pin',
        pin: nuevoPin,
        expiracion: '24 horas',
        mensaje: `Código PIN generado exitosamente: ${nuevoPin}`,
      };
    } else {
      mensajeRespuesta = `Estado del dispositivo verificado: ${dev.bloqueado ? 'Bloqueado (Cerrado)' : 'Desbloqueado (Abierto)'}`;
      detalleAccion = 'Consulta de telemetría y estado de conexión en vivo.';
    }

    // Actualizar estado del dispositivo en la base de datos
    const actualizado = await this.prisma.dispositivoIoT.update({
      where: { id: dev.id },
      data: {
        bloqueado: nuevoEstadoBloqueo,
        ultima_conexion: new Date(),
      },
    });

    // Guardar en Historial de Auditoría
    await this.prisma.historialAccionIoT.create({
      data: {
        dispositivo_id: dev.id,
        usuario_id: user.id,
        accion: dto.accion,
        metodo: dto.metodo || 'app',
        resultado: 'exitoso',
        detalles: detalleAccion,
        ip: ip || '127.0.0.1',
      },
    });

    return {
      success: true,
      dispositivo_id: actualizado.id,
      nombre: actualizado.nombre,
      accion: dto.accion,
      bloqueado: actualizado.bloqueado,
      estado_display: actualizado.bloqueado ? 'Cerrado con Cerrojo' : 'Desbloqueado (Abierto)',
      bateria: actualizado.bateria,
      mensaje: mensajeRespuesta,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── HISTORIAL DE ACCIONES DE UN DISPOSITIVO ──────────────────────
  async obtenerHistorial(dispositivoId: number, user: any) {
    const dev = await this.prisma.dispositivoIoT.findUnique({
      where: { id: dispositivoId },
      include: { inmueble: true },
    });
    if (!dev) throw new NotFoundException('Dispositivo no encontrado');

    const esPropietario = dev.inmueble.propietario_id === user.id;
    const esAdmin = user.rol === 'admin';

    return this.prisma.historialAccionIoT.findMany({
      where: esPropietario || esAdmin ? { dispositivo_id: dispositivoId } : { dispositivo_id: dispositivoId, usuario_id: user.id },
      include: {
        usuario: {
          select: { id: true, first_name: true, last_name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ─── GESTIONAR REGLAS DE ACCESO ───────────────────────────────────
  async crearReglaAcceso(dto: CreateReglaAccesoDto, user: any) {
    const dev = await this.prisma.dispositivoIoT.findUnique({
      where: { id: dto.dispositivo_id },
      include: { inmueble: true },
    });
    if (!dev) throw new NotFoundException('Dispositivo no encontrado');

    const esPropietario = dev.inmueble.propietario_id === user.id;
    const esAdmin = user.rol === 'admin';
    if (!esPropietario && !esAdmin) {
      throw new ForbiddenException('Solo el propietario puede autorizar reglas de acceso a este dispositivo');
    }

    const pin = dto.pin_codigo || Math.floor(100000 + Math.random() * 900000).toString();

    return this.prisma.reglaAccesoIoT.create({
      data: {
        dispositivo_id: dto.dispositivo_id,
        usuario_id: dto.usuario_id,
        contrato_id: dto.contrato_id || null,
        tipo_acceso: dto.tipo_acceso || 'contrato',
        pin_codigo: pin,
        fecha_inicio: new Date(dto.fecha_inicio),
        fecha_fin: dto.fecha_fin ? new Date(dto.fecha_fin) : null,
        estado: 'activo',
      },
      include: {
        usuario: {
          select: { id: true, first_name: true, last_name: true, email: true },
        },
      },
    });
  }

  async revocarReglaAcceso(reglaId: number, user: any) {
    const regla = await this.prisma.reglaAccesoIoT.findUnique({
      where: { id: reglaId },
      include: { dispositivo: { include: { inmueble: true } } },
    });
    if (!regla) throw new NotFoundException('Regla de acceso no encontrada');

    const esPropietario = regla.dispositivo.inmueble.propietario_id === user.id;
    const esAdmin = user.rol === 'admin';
    if (!esPropietario && !esAdmin) {
      throw new ForbiddenException('No tienes permisos para revocar esta regla');
    }

    return this.prisma.reglaAccesoIoT.update({
      where: { id: reglaId },
      data: { estado: 'revocado', motivo_suspension: 'Revocado manualmente por el propietario' },
    });
  }
}
