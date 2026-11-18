import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
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
      const config: any = d.configuracion || {};
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
        contratado: true,
        bloqueado_por_smart_contract: false,
        estado_modular: 'propietario_total',
        rol_acceso: 'Propietario',
        tipo_acceso: 'total_propietario',
        pin_codigo: d.codigo_maestro,
        inmueble_id: d.inmueble_id,
        inmueble_titulo: d.inmueble.titulo,
        inmueble_ciudad: d.inmueble.ciudad,
        fecha_fin: null,
        costo_mensual: Number(config.costo_mensual || 0),
        incluido_base: Boolean(config.incluido_base),
        descripcion: config.descripcion || '',
      });
    }

    // Añadir cerraduras autorizadas por regla (inquilino o visitante)
    for (const r of reglas) {
      const d = r.dispositivo;
      if (!d) continue;

      const config: any = d.configuracion || {};

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
          contratado: true,
          bloqueado_por_smart_contract: false,
          estado_modular: 'habilitado',
          rol_acceso: r.tipo_acceso === 'contrato' ? 'Inquilino (Módulo Habilitado)' : 'Visitante Autorizado',
          tipo_acceso: r.tipo_acceso,
          pin_codigo: r.pin_codigo,
          regla_id: r.id,
          contrato_id: r.contrato_id,
          smart_contract_id: r.contrato?.smart_contract_id || `CON-${r.contrato_id}`,
          inmueble_id: d.inmueble_id,
          inmueble_titulo: d.inmueble.titulo,
          inmueble_ciudad: d.inmueble.ciudad,
          fecha_inicio: r.fecha_inicio,
          fecha_fin: r.fecha_fin,
          costo_mensual: Number(config.costo_mensual || 0),
          incluido_base: Boolean(config.incluido_base),
          descripcion: config.descripcion || '',
        });
      }
    }

    // 3. Módulos del Inmueble Alquilado que NO fueron contratados (Bloqueados por Smart Contract)
    const contratosInquilino = await this.prisma.contrato.findMany({
      where: {
        inquilino_id: user.id,
        estado: { in: ['activo', 'enviado', 'aceptado'] },
      },
      include: {
        inmueble: {
          include: { dispositivos_iot: true },
        },
      },
    });

    for (const c of contratosInquilino) {
      if (!c.inmueble || !c.inmueble.dispositivos_iot) continue;

      for (const d of c.inmueble.dispositivos_iot) {
        if (!llavesMap.has(d.id)) {
          // Artefacto no contratado en el alquiler modular -> BLOQUEADO POR SMART CONTRACT
          const config: any = d.configuracion || {};
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
            bloqueado: true,
            es_propietario: false,
            contratado: false,
            bloqueado_por_smart_contract: true,
            estado_modular: 'bloqueado',
            motivo_bloqueo: 'Bloqueado por Smart Contract: Módulo no incluido en el alquiler modular',
            rol_acceso: 'No Contratado (Módulo Bloqueado)',
            tipo_acceso: 'modular_no_contratado',
            pin_codigo: null,
            contrato_id: c.id,
            smart_contract_id: c.smart_contract_id || `CON-${c.id}`,
            inmueble_id: d.inmueble_id,
            inmueble_titulo: c.inmueble.titulo,
            inmueble_ciudad: c.inmueble.ciudad,
            costo_mensual: Number(config.costo_mensual || 0),
            incluido_base: false,
            descripcion: config.descripcion || '',
          });
        }
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
          detalles: `Acceso denegado por Smart Contract: El usuario ${user.email} no tiene contratado el módulo "${dev.nombre}" en su alquiler modular.`,
          ip: ip || '127.0.0.1',
        },
      });

      throw new ForbiddenException(
        `🔒 Acceso denegado: El artefacto "${dev.nombre}" no está incluido en tu alquiler modular o tu contrato no está vigente. Habilítalo en tu contrato inteligente.`
      );
    }

    // ── Ejecutar Acción Solicitada ─────────────────────────────────
    let nuevoEstadoBloqueo = dev.bloqueado;
    let mensajeRespuesta = '';
    let detalleAccion = '';

    if (dto.accion === 'desbloquear' || dto.accion === 'encender') {
      nuevoEstadoBloqueo = false;
      if (dev.tipo === 'aire_acondicionado') {
        mensajeRespuesta = `¡${dev.nombre} encendido a 22°C en modo Inverter Frío!`;
      } else if (dev.tipo === 'smart_tv') {
        mensajeRespuesta = `¡${dev.nombre} encendido y habilitado para streaming!`;
      } else if (dev.tipo === 'porton') {
        mensajeRespuesta = `¡${dev.nombre} abierto con éxito! Portón vehicular en movimiento.`;
      } else {
        mensajeRespuesta = '¡Cerradura desbloqueada con éxito! La puerta está abierta.';
      }
      detalleAccion = `Acción ${dto.accion} ejecutada por ${esPropietario ? 'Propietario' : 'Inquilino'} (${user.first_name} ${user.last_name}).`;
    } else if (dto.accion === 'bloquear' || dto.accion === 'apagar') {
      nuevoEstadoBloqueo = true;
      if (dev.tipo === 'aire_acondicionado') {
        mensajeRespuesta = `¡${dev.nombre} apagado y puesto en modo reposo!`;
      } else if (dev.tipo === 'smart_tv') {
        mensajeRespuesta = `¡${dev.nombre} apagado y bloqueado!`;
      } else if (dev.tipo === 'porton') {
        mensajeRespuesta = `¡${dev.nombre} cerrado con cerrojo de seguridad!`;
      } else {
        mensajeRespuesta = 'Cerradura bloqueada correctamente. El cerrojo de seguridad está activo.';
      }
      detalleAccion = `Cierre/Apagado activado por ${user.first_name} ${user.last_name}.`;
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

  // ─── ALQUILER MODULAR IOT: ACTUALIZAR Y SINCRONIZAR SMART CONTRACT ─
  async actualizarModulosAlquiler(contratoId: number, dispositivosIds: number[], user: any) {
    const contrato = await this.prisma.contrato.findUnique({
      where: { id: Number(contratoId) },
      include: {
        inmueble: {
          include: { dispositivos_iot: true },
        },
      },
    });

    if (!contrato) throw new NotFoundException('Contrato no encontrado');

    const esInquilino = contrato.inquilino_id === user.id;
    const esPropietario = contrato.propietario_id === user.id;
    const esAdmin = user.rol === 'admin';

    if (!esInquilino && !esPropietario && !esAdmin) {
      throw new ForbiddenException('No tienes permisos para modificar los módulos domóticos de este contrato');
    }

    const todosDispositivos = contrato.inmueble.dispositivos_iot || [];
    const seleccionadosSet = new Set(dispositivosIds.map(Number));

    const habilitadosNombres: string[] = [];
    const bloqueadosNombres: string[] = [];

    for (const dev of todosDispositivos) {
      const debeEstarActivo = seleccionadosSet.has(dev.id);

      const regla = await this.prisma.reglaAccesoIoT.findFirst({
        where: {
          dispositivo_id: dev.id,
          contrato_id: contrato.id,
          usuario_id: contrato.inquilino_id,
        },
      });

      if (debeEstarActivo) {
        habilitadosNombres.push(dev.nombre);
        if (!regla) {
          await this.prisma.reglaAccesoIoT.create({
            data: {
              dispositivo_id: dev.id,
              usuario_id: contrato.inquilino_id,
              contrato_id: contrato.id,
              tipo_acceso: 'contrato',
              pin_codigo: dev.codigo_maestro || Math.floor(100000 + Math.random() * 900000).toString(),
              fecha_inicio: contrato.inicio,
              fecha_fin: contrato.fin,
              estado: 'activo',
            },
          });
        } else {
          await this.prisma.reglaAccesoIoT.update({
            where: { id: regla.id },
            data: {
              estado: 'activo',
              motivo_suspension: null,
            },
          });
        }

        await this.prisma.dispositivoIoT.update({
          where: { id: dev.id },
          data: { bloqueado: false },
        });

        await this.prisma.historialAccionIoT.create({
          data: {
            dispositivo_id: dev.id,
            usuario_id: user.id,
            accion: 'habilitar_modulo',
            metodo: 'app',
            resultado: 'exitoso',
            detalles: `Smart Contract: Módulo habilitado en alquiler modular por ${user.first_name || 'Usuario'}`,
          },
        });
      } else {
        bloqueadosNombres.push(dev.nombre);
        if (regla) {
          await this.prisma.reglaAccesoIoT.update({
            where: { id: regla.id },
            data: {
              estado: 'suspendido',
              motivo_suspension: 'Módulo excluido del Alquiler Modular por Smart Contract',
            },
          });
        }

        await this.prisma.dispositivoIoT.update({
          where: { id: dev.id },
          data: { bloqueado: true },
        });

        await this.prisma.historialAccionIoT.create({
          data: {
            dispositivo_id: dev.id,
            usuario_id: user.id,
            accion: 'bloquear_modulo',
            metodo: 'app',
            resultado: 'exitoso',
            detalles: `Smart Contract: Módulo bloqueado (no incluido en alquiler modular) por ${user.first_name || 'Usuario'}`,
          },
        });
      }
    }

    // Registrar bloque en Blockchain Audit del Contrato
    const auditExistente = Array.isArray(contrato.blockchain_audit)
      ? [...(contrato.blockchain_audit as any[])]
      : [];

    const txHash =
      '0x' +
      crypto
        .createHash('sha256')
        .update(`MODULAR-${contrato.id}-${dispositivosIds.sort().join(',')}-${new Date().toISOString()}`)
        .digest('hex');

    auditExistente.unshift({
      txId: txHash.substring(0, 34),
      txName: 'alquilerModularIoT',
      txType: 'alquilerModularIoT',
      blockNumber: 3000 + contrato.id,
      timestamp: new Date().toISOString(),
      assetId: `CON-${contrato.id}`,
      actor: `Smart Contract Domótico (${user.email || 'Sistema'})`,
      hash: txHash,
      data: {
        contrato_id: contrato.id,
        inmueble: contrato.inmueble.titulo,
        modulos_habilitados: habilitadosNombres,
        modulos_bloqueados: bloqueadosNombres,
        total_modulos_activos: habilitadosNombres.length,
        estado_smart_contract: 'SINCRONIZADO_INMUTABLE',
      },
      detalles: {
        habilitados: habilitadosNombres.join(', '),
        bloqueados: bloqueadosNombres.join(', '),
      },
    });

    await this.prisma.contrato.update({
      where: { id: contrato.id },
      data: { blockchain_audit: auditExistente },
    });

    return {
      success: true,
      mensaje: `Alquiler modular actualizado y sincronizado en el Smart Contract. Módulos habilitados: ${habilitadosNombres.length}, Bloqueados: ${bloqueadosNombres.length}.`,
      habilitados: habilitadosNombres,
      bloqueados: bloqueadosNombres,
      blockchain_block: 3000 + contrato.id,
      blockchain_hash: txHash,
    };
  }
}
