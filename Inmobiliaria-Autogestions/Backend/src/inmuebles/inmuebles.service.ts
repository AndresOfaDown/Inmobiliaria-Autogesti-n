import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInmuebleDto } from './dto/create-inmueble.dto';
import { UpdateInmuebleDto } from './dto/update-inmueble.dto';
import { FilterInmueblesDto } from './dto/filter-inmuebles.dto';
import { CreatePublicacionDto, UpdatePublicacionDto } from './dto/create-publicacion.dto';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { CreateTipoDto, UpdateTipoDto } from './dto/create-tipo.dto';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class InmueblesService {
  constructor(private prisma: PrismaService) {}

  // ─── HELPER: Asegurar URL Absoluta accesible desde el Frontend ───
  private getFullUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const base = process.env.BACKEND_URL || 'http://localhost:3000';
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  // ─── HELPER: Obtener IDs de favoritos del usuario ─────────────
  async getUserFavoriteIds(userId: number): Promise<number[]> {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { favoritos: true },
    });
    if (!user || !user.favoritos) return [];
    let favs: any[] = [];
    if (Array.isArray(user.favoritos)) favs = user.favoritos;
    else if (typeof user.favoritos === 'string') {
      try { favs = JSON.parse(user.favoritos); } catch { favs = []; }
    }
    return favs.map((f: any) => Number(f.inmueble_id || f.inmueble || f.id));
  }

  // ─── HELPER: Formateador de Inmueble ──────────────────────────────
  private formatInmueble(inm: any, currentUserId?: number, userFavoriteIds?: number[]) {
    // Publicaciones en JSON
    let publicaciones: any[] = [];
    if (Array.isArray(inm.publicaciones)) {
      publicaciones = inm.publicaciones;
    } else if (typeof inm.publicaciones === 'string') {
      try { publicaciones = JSON.parse(inm.publicaciones); } catch { publicaciones = []; }
    }

    const publicacionActiva = publicaciones.find((p: any) => p.estado === 'activa') || publicaciones[0];

    // Multimedia en JSON
    let multimedias: any[] = [];
    if (Array.isArray(inm.multimedia)) {
      multimedias = inm.multimedia;
    } else if (typeof inm.multimedia === 'string') {
      try { multimedias = JSON.parse(inm.multimedia); } catch { multimedias = []; }
    }

    // Normalizar URLs absolutas de archivos para que el frontend las cargue sin problemas
    multimedias = multimedias.map((m: any) => ({
      ...m,
      archivo: this.getFullUrl(m.archivo),
    }));

    const mediaPrincipal = multimedias.find((m: any) => m.principal) || multimedias[0];
    const imagenPrincipalUrl = this.getFullUrl(inm.imagen_principal) || mediaPrincipal?.archivo || null;

    // Horarios en JSON
    let horarios: any[] = [];
    if (Array.isArray(inm.horarios)) {
      horarios = inm.horarios;
    } else if (typeof inm.horarios === 'string') {
      try { horarios = JSON.parse(inm.horarios); } catch { horarios = []; }
    }

    // Normalizar dirección
    let dirObj = inm.direccion;
    if (!dirObj || typeof dirObj !== 'object') {
      dirObj = {
        ciudad: inm.ciudad || '',
        zona: inm.zona || '',
        calle: inm.calle || '',
        referencia: inm.referencia || '',
      };
    }

    const precioFinal = publicacionActiva?.precio != null
      ? Number(publicacionActiva.precio)
      : (inm.precio != null ? Number(inm.precio) : null);

    const isFav = userFavoriteIds
      ? userFavoriteIds.includes(inm.id)
      : false;

    return {
      id: inm.id,
      titulo: inm.titulo,
      descripcion: inm.descripcion,
      tipo: inm.tipo_id,
      tipo_nombre: inm.tipo_relacion?.nombre || null,
      tipo_relacion: inm.tipo_relacion,
      propietario: inm.propietario_id,
      propietario_id: inm.propietario_id,
      propietario_relacion: inm.propietario_relacion
        ? {
            id: inm.propietario_relacion.id,
            first_name: inm.propietario_relacion.first_name,
            last_name: inm.propietario_relacion.last_name,
            email: inm.propietario_relacion.email,
            telefono: inm.propietario_relacion.telefono,
            ci: inm.propietario_relacion.ci,
            foto: this.getFullUrl(inm.propietario_relacion.foto),
          }
        : null,
      ciudad: inm.ciudad || dirObj.ciudad,
      zona: inm.zona || dirObj.zona,
      calle: inm.calle || dirObj.calle,
      referencia: inm.referencia || dirObj.referencia,
      direccion: dirObj,
      direccion_fk: dirObj,
      precio: precioFinal,
      tipo_oferta: publicacionActiva?.tipo_oferta || inm.tipo_oferta || 'alquiler',
      valor_activo: inm.valor_activo != null ? Number(inm.valor_activo) : null,
      superficie: inm.superficie != null ? Number(inm.superficie) : null,
      largo: inm.largo != null ? Number(inm.largo) : null,
      ancho: inm.ancho != null ? Number(inm.ancho) : null,
      habitaciones: inm.habitaciones,
      banos: inm.banos,
      garaje: inm.garaje,
      estado: inm.estado,
      gps: inm.gps,
      verificacion_estado: inm.verificacion_estado,
      imagen_principal: imagenPrincipalUrl,
      multimedia: multimedias,
      publicaciones: publicaciones.map((p: any) => ({
        ...p,
        precio: Number(p.precio),
      })),
      horarios,
      is_favorito: isFav,
      createdAt: inm.createdAt,
      updatedAt: inm.updatedAt,
    };
  }

  // ─── 1. CATÁLOGO PÚBLICO DE INMUEBLES ─────────────────────────────
  // REGLA: Los usuarios convencionales o anónimos SOLO pueden ver inmuebles en estado 'disponible' o 'publicado'
  async listarCatalogoPublico(filters: FilterInmueblesDto, currentUserId?: number) {
    const where: any = {
      estado: { in: ['disponible', 'publicado'] },
    };

    if (filters.search) {
      where.OR = [
        { titulo: { contains: filters.search, mode: 'insensitive' } },
        { descripcion: { contains: filters.search, mode: 'insensitive' } },
        { ciudad: { contains: filters.search, mode: 'insensitive' } },
        { zona: { contains: filters.search, mode: 'insensitive' } },
        { calle: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.tipo) {
      where.tipo_id = filters.tipo;
    }

    if (filters.ciudad) {
      where.ciudad = { contains: filters.ciudad, mode: 'insensitive' };
    }

    if (filters.habitaciones_min != null) {
      where.habitaciones = { gte: filters.habitaciones_min };
    }

    if (filters.banos_min != null) {
      where.banos = { gte: filters.banos_min };
    }

    if (filters.garaje) {
      where.garaje = true;
    }

    if (filters.precio_max != null) {
      where.precio = { lte: filters.precio_max };
    }

    if (filters.tipo_oferta) {
      where.tipo_oferta = filters.tipo_oferta;
    }

    const items = await this.prisma.inmueble.findMany({
      where,
      include: {
        tipo_relacion: true,
        propietario_relacion: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const favIds = currentUserId ? await this.getUserFavoriteIds(currentUserId) : [];
    return items.map((inm) => this.formatInmueble(inm, currentUserId, favIds));
  }

  // ─── 2. DETALLE DE UN INMUEBLE ────────────────────────────────────
  async getById(id: number, currentUser?: any) {
    const inm = await this.prisma.inmueble.findUnique({
      where: { id },
      include: {
        tipo_relacion: true,
        propietario_relacion: true,
      },
    });

    if (!inm) {
      throw new NotFoundException(`Inmueble con ID ${id} no encontrado`);
    }

    const estaPublicado = ['disponible', 'publicado'].includes(inm.estado);
    if (!estaPublicado) {
      const esPropietario = currentUser?.id === inm.propietario_id;
      const esAdmin = currentUser?.rol === 'admin';

      if (!esPropietario && !esAdmin) {
        throw new ForbiddenException('Este inmueble no se encuentra publicado en el catálogo público.');
      }
    }

    const favIds = currentUser?.id ? await this.getUserFavoriteIds(currentUser.id) : [];
    return this.formatInmueble(inm, currentUser?.id, favIds);
  }

  // ─── 3. PANEL DE GESTIÓN (Mis Inmuebles o Auditoría Admin) ─────────
  async listarPanel(currentUser: any, personalOnly = false) {
    const esAdmin = currentUser.rol === 'admin';
    const where: any = {};

    if (!esAdmin || personalOnly) {
      where.propietario_id = currentUser.id;
    }

    const items = await this.prisma.inmueble.findMany({
      where,
      include: {
        tipo_relacion: true,
        propietario_relacion: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((inm) => this.formatInmueble(inm, currentUser.id));
  }

  // ─── 4. REGISTRAR / PUBLICAR INMUEBLE ─────────────────────────────
  async create(dto: CreateInmuebleDto, currentUser: any) {
    const tipoExiste = await this.prisma.tipoInmueble.findUnique({
      where: { id: dto.tipo },
    });
    if (!tipoExiste) {
      throw new BadRequestException(`El tipo o categoría de inmueble (${dto.tipo}) no existe`);
    }

    const dir = dto.direccion || dto.direccion_fk || {};
    const ciudad = dto.ciudad || dir.ciudad || '';
    const zona = dto.zona || dir.zona || '';
    const calle = dto.calle || dir.calle || '';
    const referencia = dto.referencia || dir.referencia || '';

    const publicacionesIniciales = dto.precio != null && Number(dto.precio) > 0
      ? [{ id: Date.now(), inmueble: 0, tipo_oferta: 'alquiler', precio: Number(dto.precio), estado: 'activa' }]
      : [];

    const nuevo = await this.prisma.inmueble.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion || null,
        tipo_id: dto.tipo,
        propietario_id: currentUser.id,
        ciudad,
        zona,
        calle,
        referencia,
        direccion: { ciudad, zona, calle, referencia },
        precio: dto.precio != null ? dto.precio : null,
        tipo_oferta: 'alquiler',
        valor_activo: dto.valor_activo != null ? dto.valor_activo : null,
        superficie: dto.superficie != null ? dto.superficie : null,
        largo: dto.largo != null ? dto.largo : null,
        ancho: dto.ancho != null ? dto.ancho : null,
        habitaciones: dto.habitaciones ?? 0,
        banos: dto.banos ?? 0,
        garaje: dto.garaje ?? false,
        estado: dto.estado || 'disponible',
        gps: dto.gps || null,
        multimedia: [],
        publicaciones: publicacionesIniciales,
        horarios: [],
      },
      include: {
        tipo_relacion: true,
        propietario_relacion: true,
      },
    });

    return this.getById(nuevo.id, currentUser);
  }

  // ─── 5. ACTUALIZAR INMUEBLE ───────────────────────────────────────
  async update(id: number, dto: UpdateInmuebleDto, currentUser: any) {
    const inm = await this.prisma.inmueble.findUnique({ where: { id } });
    if (!inm) {
      throw new NotFoundException(`Inmueble con ID ${id} no encontrado`);
    }

    const esPropietario = inm.propietario_id === currentUser.id;
    const esAdmin = currentUser.rol === 'admin';

    if (!esPropietario && !esAdmin) {
      throw new ForbiddenException('No tienes permisos para modificar este inmueble');
    }

    const updateData: any = {};

    if (dto.titulo !== undefined) updateData.titulo = dto.titulo;
    if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion;
    if (dto.tipo !== undefined) {
      const tipoExiste = await this.prisma.tipoInmueble.findUnique({ where: { id: dto.tipo } });
      if (!tipoExiste) throw new BadRequestException(`Categoría ${dto.tipo} no existe`);
      updateData.tipo_id = dto.tipo;
    }

    const dir = dto.direccion || dto.direccion_fk;
    if (dir) {
      updateData.ciudad = dir.ciudad ?? inm.ciudad;
      updateData.zona = dir.zona ?? inm.zona;
      updateData.calle = dir.calle ?? inm.calle;
      updateData.referencia = dir.referencia ?? inm.referencia;
      updateData.direccion = {
        ciudad: updateData.ciudad,
        zona: updateData.zona,
        calle: updateData.calle,
        referencia: updateData.referencia,
      };
    } else {
      if (dto.ciudad !== undefined) updateData.ciudad = dto.ciudad;
      if (dto.zona !== undefined) updateData.zona = dto.zona;
      if (dto.calle !== undefined) updateData.calle = dto.calle;
      if (dto.referencia !== undefined) updateData.referencia = dto.referencia;
      if (dto.ciudad || dto.zona || dto.calle || dto.referencia) {
        updateData.direccion = {
          ciudad: updateData.ciudad ?? inm.ciudad,
          zona: updateData.zona ?? inm.zona,
          calle: updateData.calle ?? inm.calle,
          referencia: updateData.referencia ?? inm.referencia,
        };
      }
    }

    if (dto.precio !== undefined) updateData.precio = dto.precio;
    if (dto.valor_activo !== undefined) updateData.valor_activo = dto.valor_activo;
    if (dto.superficie !== undefined) updateData.superficie = dto.superficie;
    if (dto.largo !== undefined) updateData.largo = dto.largo;
    if (dto.ancho !== undefined) updateData.ancho = dto.ancho;
    if (dto.habitaciones !== undefined) updateData.habitaciones = dto.habitaciones;
    if (dto.banos !== undefined) updateData.banos = dto.banos;
    if (dto.garaje !== undefined) updateData.garaje = dto.garaje;
    if (dto.estado !== undefined) updateData.estado = dto.estado;
    if (dto.gps !== undefined) updateData.gps = dto.gps;
    if (dto.verificacion_estado !== undefined) updateData.verificacion_estado = dto.verificacion_estado;

    await this.prisma.inmueble.update({
      where: { id },
      data: updateData,
    });

    return this.getById(id, currentUser);
  }

  // ─── 6. ELIMINAR INMUEBLE ─────────────────────────────────────────
  async remove(id: number, currentUser: any) {
    const inm = await this.prisma.inmueble.findUnique({ where: { id } });
    if (!inm) {
      throw new NotFoundException(`Inmueble con ID ${id} no encontrado`);
    }

    const esPropietario = inm.propietario_id === currentUser.id;
    const esAdmin = currentUser.rol === 'admin';

    if (!esPropietario && !esAdmin) {
      throw new ForbiddenException('No tienes permiso para eliminar este inmueble');
    }

    // Limpiar archivos físicos de disco
    const multimedias: any[] = Array.isArray(inm.multimedia) ? (inm.multimedia as any[]) : [];
    for (const media of multimedias) {
      if (media.archivo && typeof media.archivo === 'string') {
        const localRel = media.archivo.replace(/^https?:\/\/[^\/]+/, '');
        if (localRel.startsWith('/uploads/')) {
          const fullPath = join(process.cwd(), localRel);
          if (fs.existsSync(fullPath)) {
            try { fs.unlinkSync(fullPath); } catch {}
          }
        }
      }
    }

    await this.prisma.inmueble.delete({ where: { id } });
    return { success: true, message: 'Inmueble eliminado correctamente' };
  }

  // ─── 7. GESTIÓN MULTIMEDIA (Guardado en JSON del Inmueble) ─────────
  async uploadMultimedia(
    inmuebleId: number,
    file: Express.Multer.File,
    tipo: string,
    principal: boolean,
    descripcion: string,
    currentUser: any,
  ) {
    const inm = await this.prisma.inmueble.findUnique({ where: { id: inmuebleId } });
    if (!inm) throw new NotFoundException(`Inmueble no encontrado`);

    const esPropietario = inm.propietario_id === currentUser.id;
    const esAdmin = currentUser.rol === 'admin';
    if (!esPropietario && !esAdmin) {
      throw new ForbiddenException('No tienes permiso para subir multimedia a este inmueble');
    }

    if (!file) throw new BadRequestException('No se ha proporcionado ningún archivo');

    // Construir URL absoluta con host del servidor para que el frontend (Vite) la cargue directamente
    const fullArchivoUrl = this.getFullUrl(`/uploads/inmuebles/${file.filename}`)!;

    let currentMedia: any[] = Array.isArray(inm.multimedia) ? [...(inm.multimedia as any[])] : [];

    // Si se marca como principal, desmarcar anteriores
    if (principal) {
      currentMedia = currentMedia.map((m) => ({ ...m, principal: false }));
    }

    const newMediaItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      inmueble: inmuebleId,
      tipo: tipo || 'imagen',
      archivo: fullArchivoUrl,
      principal: principal || currentMedia.length === 0,
      descripcion: descripcion || '',
      orden: currentMedia.length,
    };

    currentMedia.push(newMediaItem);

    const updatePayload: any = {
      multimedia: currentMedia,
    };

    if (newMediaItem.principal && newMediaItem.tipo !== 'musica') {
      updatePayload.imagen_principal = fullArchivoUrl;
    } else if (!inm.imagen_principal && newMediaItem.tipo === 'imagen') {
      updatePayload.imagen_principal = fullArchivoUrl;
    }

    await this.prisma.inmueble.update({
      where: { id: inmuebleId },
      data: updatePayload,
    });

    return newMediaItem;
  }

  async deleteMultimedia(mediaId: number, currentUser: any) {
    // Buscar inmueble que contenga este mediaId
    const inmuebles = await this.prisma.inmueble.findMany();
    let targetInmueble: any = null;
    let targetMedia: any = null;

    for (const inm of inmuebles) {
      const mediaList: any[] = Array.isArray(inm.multimedia) ? (inm.multimedia as any[]) : [];
      const found = mediaList.find((m) => Number(m.id) === Number(mediaId));
      if (found) {
        targetInmueble = inm;
        targetMedia = found;
        break;
      }
    }

    if (!targetInmueble || !targetMedia) {
      return { success: true };
    }

    const esPropietario = targetInmueble.propietario_id === currentUser.id;
    const esAdmin = currentUser.rol === 'admin';
    if (!esPropietario && !esAdmin) {
      throw new ForbiddenException('No tienes permiso para eliminar este archivo');
    }

    // Borrar de disco si es local
    if (targetMedia.archivo && typeof targetMedia.archivo === 'string') {
      const localRel = targetMedia.archivo.replace(/^https?:\/\/[^\/]+/, '');
      if (localRel.startsWith('/uploads/')) {
        const fullPath = join(process.cwd(), localRel);
        if (fs.existsSync(fullPath)) {
          try { fs.unlinkSync(fullPath); } catch {}
        }
      }
    }

    const filteredMedia = (targetInmueble.multimedia as any[]).filter(
      (m: any) => Number(m.id) !== Number(mediaId),
    );

    await this.prisma.inmueble.update({
      where: { id: targetInmueble.id },
      data: {
        multimedia: filteredMedia,
        imagen_principal: filteredMedia.find((m: any) => m.principal)?.archivo || filteredMedia[0]?.archivo || null,
      },
    });

    return { success: true };
  }

  // ─── 8. PUBLICACIONES (Ofertas y Precios en JSON) ───────────────────
  async listarPublicaciones(inmuebleId: number) {
    const inm = await this.prisma.inmueble.findUnique({ where: { id: inmuebleId } });
    if (!inm) return [];
    return Array.isArray(inm.publicaciones) ? inm.publicaciones : [];
  }

  async crearPublicacion(dto: CreatePublicacionDto, currentUser: any) {
    const inm = await this.prisma.inmueble.findUnique({ where: { id: dto.inmueble } });
    if (!inm) throw new NotFoundException('Inmueble no encontrado');

    const esPropietario = inm.propietario_id === currentUser.id;
    const esAdmin = currentUser.rol === 'admin';
    if (!esPropietario && !esAdmin) {
      throw new ForbiddenException('No tienes permiso para publicar este inmueble');
    }

    const currentPubs: any[] = Array.isArray(inm.publicaciones) ? [...(inm.publicaciones as any[])] : [];
    const newPub = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      inmueble: dto.inmueble,
      tipo_oferta: dto.tipo_oferta,
      precio: Number(dto.precio),
      estado: dto.estado || 'activa',
    };

    currentPubs.unshift(newPub);

    await this.prisma.inmueble.update({
      where: { id: dto.inmueble },
      data: {
        precio: dto.precio,
        tipo_oferta: dto.tipo_oferta,
        publicaciones: currentPubs,
      },
    });

    return newPub;
  }

  async cambiarEstadoPublicacion(pubId: number, dto: UpdatePublicacionDto, currentUser: any) {
    const inmuebles = await this.prisma.inmueble.findMany();
    for (const inm of inmuebles) {
      const pubs: any[] = Array.isArray(inm.publicaciones) ? (inm.publicaciones as any[]) : [];
      const index = pubs.findIndex((p) => Number(p.id) === Number(pubId));
      if (index !== -1) {
        const esPropietario = inm.propietario_id === currentUser.id;
        const esAdmin = currentUser.rol === 'admin';
        if (!esPropietario && !esAdmin) {
          throw new ForbiddenException('No tienes permiso para modificar esta publicación');
        }

        if (dto.estado) pubs[index].estado = dto.estado;
        if (dto.precio != null) pubs[index].precio = Number(dto.precio);
        if (dto.tipo_oferta) pubs[index].tipo_oferta = dto.tipo_oferta;

        await this.prisma.inmueble.update({
          where: { id: inm.id },
          data: { publicaciones: pubs },
        });

        return pubs[index];
      }
    }
    throw new NotFoundException('Publicación no encontrada');
  }

  // ─── 9. HORARIOS DE VISITA (En JSON) ──────────────────────────────
  async listarHorarios(inmuebleId: number) {
    const inm = await this.prisma.inmueble.findUnique({ where: { id: inmuebleId } });
    if (!inm) return [];
    return Array.isArray(inm.horarios) ? (inm.horarios as any[]).filter((h) => h.activo !== false) : [];
  }

  async crearHorario(dto: CreateHorarioDto, currentUser: any) {
    const inm = await this.prisma.inmueble.findUnique({ where: { id: dto.inmueble } });
    if (!inm) throw new NotFoundException('Inmueble no encontrado');

    const esPropietario = inm.propietario_id === currentUser.id;
    const esAdmin = currentUser.rol === 'admin';
    if (!esPropietario && !esAdmin) {
      throw new ForbiddenException('No tienes permiso para gestionar horarios');
    }

    const currentHorarios: any[] = Array.isArray(inm.horarios) ? [...(inm.horarios as any[])] : [];
    const nuevoHorario = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      inmueble: dto.inmueble,
      dia_semana: dto.dia_semana,
      hora_inicio: dto.hora_inicio,
      hora_fin: dto.hora_fin,
      activo: dto.activo ?? true,
    };
    currentHorarios.push(nuevoHorario);

    await this.prisma.inmueble.update({
      where: { id: dto.inmueble },
      data: { horarios: currentHorarios },
    });

    return nuevoHorario;
  }

  async eliminarHorario(horarioId: number, currentUser: any) {
    const inmuebles = await this.prisma.inmueble.findMany();
    for (const inm of inmuebles) {
      const horarios: any[] = Array.isArray(inm.horarios) ? (inm.horarios as any[]) : [];
      const filtered = horarios.filter((h) => Number(h.id) !== Number(horarioId));
      if (filtered.length !== horarios.length) {
        const esPropietario = inm.propietario_id === currentUser.id;
        const esAdmin = currentUser.rol === 'admin';
        if (!esPropietario && !esAdmin) {
          throw new ForbiddenException('No tienes permiso para eliminar este horario');
        }

        await this.prisma.inmueble.update({
          where: { id: inm.id },
          data: { horarios: filtered },
        });

        return { success: true };
      }
    }
    return { success: true };
  }

  // ─── 10. FAVORITOS (CU9) ─────────────────────────────────────────
  async listarFavoritos(userId: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { favoritos: true },
    });
    if (!user || !user.favoritos) return [];

    let favs: any[] = [];
    if (Array.isArray(user.favoritos)) favs = user.favoritos;
    else if (typeof user.favoritos === 'string') {
      try { favs = JSON.parse(user.favoritos); } catch { favs = []; }
    }

    const result: any[] = [];
    for (const f of favs) {
      const inmId = Number(f.inmueble_id || f.inmueble);
      const inm = await this.prisma.inmueble.findUnique({
        where: { id: inmId },
        include: { tipo_relacion: true, propietario_relacion: true },
      });
      if (inm) {
        const formatted = this.formatInmueble(inm, userId, [inmId]);
        result.push({
          id: f.id || inmId,
          inmueble: inmId,
          usuario: userId,
          creado: f.creado || inm.createdAt,
          inmueble_data: formatted,
        });
      }
    }
    return result;
  }

  async toggleFavorito(inmuebleId: number, userId: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { favoritos: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    let favs: any[] = [];
    if (Array.isArray(user.favoritos)) favs = [...(user.favoritos as any[])];
    else if (typeof user.favoritos === 'string') {
      try { favs = JSON.parse(user.favoritos); } catch { favs = []; }
    }

    const index = favs.findIndex((f) => Number(f.inmueble_id || f.inmueble) === Number(inmuebleId));
    let isFavorito = false;

    if (index !== -1) {
      // Remover de favoritos
      favs.splice(index, 1);
      isFavorito = false;
    } else {
      // Agregar a favoritos
      favs.unshift({
        id: Date.now(),
        inmueble_id: Number(inmuebleId),
        inmueble: Number(inmuebleId),
        creado: new Date().toISOString(),
      });
      isFavorito = true;
    }

    await this.prisma.usuario.update({
      where: { id: userId },
      data: { favoritos: favs },
    });

    return { is_favorito: isFavorito };
  }

  async eliminarFavorito(idOrInmuebleId: number, userId: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { favoritos: true },
    });
    if (!user) return { success: true };

    let favs: any[] = [];
    if (Array.isArray(user.favoritos)) favs = [...(user.favoritos as any[])];
    else if (typeof user.favoritos === 'string') {
      try { favs = JSON.parse(user.favoritos); } catch { favs = []; }
    }

    const filtered = favs.filter(
      (f) => Number(f.id) !== Number(idOrInmuebleId) && Number(f.inmueble_id || f.inmueble) !== Number(idOrInmuebleId),
    );

    await this.prisma.usuario.update({
      where: { id: userId },
      data: { favoritos: filtered },
    });

    return { success: true };
  }

  // ─── 11. CATEGORÍAS / TIPOS DE INMUEBLE ───────────────────────────
  async listarTipos() {
    return this.prisma.tipoInmueble.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async crearTipo(dto: CreateTipoDto) {
    const existente = await this.prisma.tipoInmueble.findUnique({
      where: { nombre: dto.nombre },
    });
    if (existente) {
      throw new BadRequestException(`Ya existe una categoría con el nombre ${dto.nombre}`);
    }
    return this.prisma.tipoInmueble.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
      },
    });
  }

  async actualizarTipo(id: number, dto: UpdateTipoDto) {
    const tipo = await this.prisma.tipoInmueble.findUnique({ where: { id } });
    if (!tipo) throw new NotFoundException('Categoría no encontrada');

    return this.prisma.tipoInmueble.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
      },
    });
  }

  async eliminarTipo(id: number) {
    const conInmuebles = await this.prisma.inmueble.count({ where: { tipo_id: id } });
    if (conInmuebles > 0) {
      throw new BadRequestException('No se puede eliminar la categoría porque tiene inmuebles asociados');
    }
    await this.prisma.tipoInmueble.delete({ where: { id } });
    return { success: true };
  }

  // ─── 12. CHECK DE ACCESO 360 / VR ─────────────────────────────────
  async checkAcceso360(inmuebleId: number, currentUser?: any) {
    if (!currentUser) {
      return { tiene_acceso: false, propietario: false, fecha_expiracion: null, acceso_id: null };
    }

    const inm = await this.prisma.inmueble.findUnique({ where: { id: inmuebleId } });
    if (!inm) throw new NotFoundException('Inmueble no encontrado');

    const esPropietario = inm.propietario_id === currentUser.id;
    const esAdmin = currentUser.rol === 'admin';

    if (esPropietario || esAdmin) {
      return {
        tiene_acceso: true,
        propietario: true,
        fecha_expiracion: null,
        acceso_id: null,
      };
    }

    return {
      tiene_acceso: true,
      propietario: false,
      fecha_expiracion: null,
      acceso_id: null,
    };
  }
}
