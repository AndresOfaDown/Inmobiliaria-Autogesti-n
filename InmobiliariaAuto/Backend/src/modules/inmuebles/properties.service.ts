import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

import { Inmueble, EstadoInmueble } from './entities/inmueble.entity';
import { TipoInmueble } from './entities/tipo-inmueble.entity';
import { Direccion } from './entities/direccion.entity';
import { Multimedia, TipoMultimedia } from './entities/multimedia.entity';
import { Hotspot } from './entities/hotspot.entity';
import { Publicacion, EstadoPublicacion, TipoOferta } from './entities/publicacion.entity';
import { Cita, EstadoCita } from './entities/cita.entity';
import { HorarioDisponible } from './entities/horario-disponible.entity';
import { VerificacionTitulo, EstadoVerificacion } from './entities/verificacion-titulo.entity';
import { AccesoRecorrido360 } from './entities/acceso-recorrido.entity';
import { Favorito } from './entities/favorito.entity';

import { BlockchainService } from '../blockchain/blockchain.service';
import { AiService } from '../ia/ai.service';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Inmueble)
    private inmuebleRepo: Repository<Inmueble>,
    @InjectRepository(TipoInmueble)
    private tipoRepo: Repository<TipoInmueble>,
    @InjectRepository(Direccion)
    private direccionRepo: Repository<Direccion>,
    @InjectRepository(Multimedia)
    private mediaRepo: Repository<Multimedia>,
    @InjectRepository(Hotspot)
    private hotspotRepo: Repository<Hotspot>,
    @InjectRepository(Publicacion)
    private publicacionRepo: Repository<Publicacion>,
    @InjectRepository(Cita)
    private citaRepo: Repository<Cita>,
    @InjectRepository(HorarioDisponible)
    private horarioRepo: Repository<HorarioDisponible>,
    @InjectRepository(VerificacionTitulo)
    private verificacionRepo: Repository<VerificacionTitulo>,
    @InjectRepository(AccesoRecorrido360)
    private accesoRepo: Repository<AccesoRecorrido360>,
    @InjectRepository(Favorito)
    private favoritoRepo: Repository<Favorito>,

    private blockchainService: BlockchainService,
    private aiService: AiService,
  ) {}

  // Tipos de Inmueble
  async getTiposInmueble() {
    return this.tipoRepo.find();
  }

  async createTipoInmueble(nombre: string, descripcion?: string) {
    const tipo = this.tipoRepo.create({ nombre, descripcion });
    return this.tipoRepo.save(tipo);
  }

  // Explorar / Catálogo público con filtros avanzados
  async searchProperties(filters: {
    tipoId?: string;
    tipoOferta?: TipoOferta;
    ciudad?: string;
    zona?: string;
    precioMin?: number;
    precioMax?: number;
    habitaciones?: number;
    banos?: number;
    garaje?: boolean;
    search?: string;
  }) {
    const qb = this.inmuebleRepo
      .createQueryBuilder('inmueble')
      .leftJoinAndSelect('inmueble.tipo', 'tipo')
      .leftJoinAndSelect('inmueble.direccion', 'direccion')
      .leftJoinAndSelect('inmueble.propietario', 'propietario')
      .leftJoinAndSelect('inmueble.multimedia', 'multimedia')
      .leftJoinAndSelect(
        'inmueble.publicaciones',
        'publicacion',
        'publicacion.estado = :pubEstado',
        { pubEstado: EstadoPublicacion.ACTIVA },
      )
      .where('inmueble.estado != :oculto', { oculto: EstadoInmueble.OCULTO });

    if (filters.tipoId) {
      qb.andWhere('inmueble.tipoId = :tipoId', { tipoId: filters.tipoId });
    }

    if (filters.tipoOferta) {
      qb.andWhere('publicacion.tipoOferta = :tipoOferta', {
        tipoOferta: filters.tipoOferta,
      });
    }

    if (filters.ciudad) {
      qb.andWhere('LOWER(direccion.ciudad) LIKE LOWER(:ciudad)', {
        ciudad: `%${filters.ciudad}%`,
      });
    }

    if (filters.zona) {
      qb.andWhere('LOWER(direccion.zona) LIKE LOWER(:zona)', {
        zona: `%${filters.zona}%`,
      });
    }

    if (filters.precioMin !== undefined) {
      qb.andWhere('publicacion.precio >= :precioMin', {
        precioMin: filters.precioMin,
      });
    }

    if (filters.precioMax !== undefined) {
      qb.andWhere('publicacion.precio <= :precioMax', {
        precioMax: filters.precioMax,
      });
    }

    if (filters.habitaciones !== undefined && filters.habitaciones > 0) {
      qb.andWhere('inmueble.habitaciones >= :habs', {
        habs: filters.habitaciones,
      });
    }

    if (filters.banos !== undefined && filters.banos > 0) {
      qb.andWhere('inmueble.banos >= :banos', { banos: filters.banos });
    }

    if (filters.garaje !== undefined) {
      qb.andWhere('inmueble.garaje = :garaje', { garaje: filters.garaje });
    }

    if (filters.search) {
      qb.andWhere(
        '(LOWER(inmueble.titulo) LIKE LOWER(:search) OR LOWER(inmueble.descripcion) LIKE LOWER(:search) OR LOWER(direccion.zona) LIKE LOWER(:search) OR LOWER(direccion.ciudad) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }

    qb.orderBy('inmueble.creado', 'DESC');
    return qb.getMany();
  }

  // Detalle de inmueble
  async getPropertyById(id: string) {
    const inmueble = await this.inmuebleRepo.findOne({
      where: { id },
      relations: [
        'tipo',
        'direccion',
        'propietario',
        'multimedia',
        'multimedia.hotspotsSalientes',
        'multimedia.hotspotsSalientes.escenaDestino',
        'publicaciones',
      ],
    });

    if (!inmueble) {
      throw new NotFoundException('Inmueble no encontrado');
    }

    // Check verification status
    const verificacion = await this.verificacionRepo.findOne({
      where: { inmuebleId: id },
      order: { creado: 'DESC' },
    });

    return {
      ...inmueble,
      verificacionLegal: verificacion || null,
    };
  }

  // Mis Inmuebles (Propietario)
  async getPropertiesByOwner(propietarioId: string) {
    return this.inmuebleRepo.find({
      where: { propietarioId },
      relations: ['tipo', 'direccion', 'publicaciones', 'multimedia'],
      order: { creado: 'DESC' },
    });
  }

  // Crear Inmueble
  async createProperty(
    propietarioId: string,
    data: {
      tipoId: string;
      titulo: string;
      descripcion: string;
      largo?: number;
      ancho?: number;
      superficie: number;
      habitaciones: number;
      banos: number;
      garaje: boolean;
      gps?: string;
      modelo3dUrl?: string;
      valorActivo?: number;
      direccion: {
        ciudad: string;
        zona: string;
        calle: string;
        referencia?: string;
        latitud?: number;
        longitud?: number;
      };
      publicacion?: {
        tipoOferta: TipoOferta;
        precio: number;
        moneda?: string;
      };
      multimedia?: Array<{
        tipo: TipoMultimedia;
        archivoUrl: string;
        descripcion?: string;
        principal?: boolean;
        orden?: number;
      }>;
    },
  ) {
    // 1. Crear direccion
    const direccion = this.direccionRepo.create(data.direccion);
    const savedDir = await this.direccionRepo.save(direccion);

    // 2. Crear inmueble
    const inmueble = this.inmuebleRepo.create({
      propietarioId,
      tipoId: data.tipoId,
      direccionId: savedDir.id,
      titulo: data.titulo,
      descripcion: data.descripcion,
      largo: data.largo,
      ancho: data.ancho,
      superficie: data.superficie,
      habitaciones: data.habitaciones,
      banos: data.banos,
      garaje: data.garaje,
      gps: data.gps,
      modelo3dUrl: data.modelo3dUrl,
      valorActivo: data.valorActivo,
      estado: EstadoInmueble.DISPONIBLE,
    });
    const savedInmueble = await this.inmuebleRepo.save(inmueble);

    // 3. Crear publicación activa si se proveyó
    if (data.publicacion) {
      const pub = this.publicacionRepo.create({
        inmuebleId: savedInmueble.id,
        tipoOferta: data.publicacion.tipoOferta,
        precio: data.publicacion.precio,
        moneda: data.publicacion.moneda || 'USD',
        estado: EstadoPublicacion.ACTIVA,
      });
      await this.publicacionRepo.save(pub);
    }

    // 4. Crear multimedia inicial si se proveyó
    if (data.multimedia && data.multimedia.length > 0) {
      for (const m of data.multimedia) {
        const item = this.mediaRepo.create({
          inmuebleId: savedInmueble.id,
          tipo: m.tipo,
          archivoUrl: m.archivoUrl,
          descripcion: m.descripcion,
          principal: m.principal || false,
          orden: m.orden || 0,
        });
        await this.mediaRepo.save(item);
      }
    }

    // 5. Registrar en Blockchain Ledger (Certificación inicial)
    const titleHash = `HASH-TIT-${savedInmueble.id.slice(0, 8)}-${Date.now()}`;
    this.blockchainService.recordPropertyRegistration(
      savedInmueble.id,
      propietarioId,
      titleHash,
      {
        titulo: savedInmueble.titulo,
        superficie: savedInmueble.superficie,
        ciudad: data.direccion.ciudad,
      },
    );

    savedInmueble.hashBlockchain = titleHash;
    await this.inmuebleRepo.save(savedInmueble);

    return this.getPropertyById(savedInmueble.id);
  }

  // Actualizar Inmueble
  async updateProperty(
    id: string,
    propietarioId: string,
    data: Partial<Inmueble> & { direccion?: any; publicacion?: any },
  ) {
    const inmueble = await this.inmuebleRepo.findOne({ where: { id } });
    if (!inmueble) throw new NotFoundException('Inmueble no encontrado');

    if (data.direccion && inmueble.direccionId) {
      await this.direccionRepo.update(inmueble.direccionId, data.direccion);
      delete data.direccion;
    }

    if (data.publicacion) {
      const existingPub = await this.publicacionRepo.findOne({
        where: { inmuebleId: id },
      });
      if (existingPub) {
        await this.publicacionRepo.update(existingPub.id, data.publicacion);
      } else {
        const newPub = this.publicacionRepo.create({
          inmuebleId: id,
          ...data.publicacion,
        });
        await this.publicacionRepo.save(newPub);
      }
      delete data.publicacion;
    }

    await this.inmuebleRepo.update(id, data);
    return this.getPropertyById(id);
  }

  // Eliminar Inmueble
  async deleteProperty(id: string, propietarioId: string) {
    const inmueble = await this.inmuebleRepo.findOne({ where: { id } });
    if (!inmueble) throw new NotFoundException('Inmueble no encontrado');
    await this.inmuebleRepo.remove(inmueble);
    return { success: true };
  }

  // Multimedia & Recorridos 360°
  async addMultimedia(
    inmuebleId: string,
    items: Array<{
      tipo: TipoMultimedia;
      archivoUrl: string;
      descripcion?: string;
      principal?: boolean;
      orden?: number;
    }>,
  ) {
    const saved = [];
    for (const item of items) {
      const media = this.mediaRepo.create({ ...item, inmuebleId });
      saved.push(await this.mediaRepo.save(media));
    }
    return saved;
  }

  async deleteMultimedia(mediaId: string) {
    await this.mediaRepo.delete(mediaId);
    return { success: true };
  }

  // Hotspots para recorridos virtuales
  async addHotspot(data: {
    inmuebleId: string;
    escenaOrigenId: string;
    escenaDestinoId: string;
    pitch: number;
    yaw: number;
    textoAyuda?: string;
  }) {
    const hotspot = this.hotspotRepo.create(data);
    return this.hotspotRepo.save(hotspot);
  }

  async deleteHotspot(id: string) {
    await this.hotspotRepo.delete(id);
    return { success: true };
  }

  // Verificación Legal Automatizada (IA + OCR + Blockchain)
  async requestTitleVerification(
    inmuebleId: string,
    solicitadoPorId: string,
    archivoTituloUrl: string,
    textoOcr?: string,
  ) {
    const inmueble = await this.inmuebleRepo.findOne({ where: { id: inmuebleId } });
    if (!inmueble) throw new NotFoundException('Inmueble no encontrado');

    const resultIa = await this.aiService.verifyPropertyDeed(
      textoOcr || archivoTituloUrl,
      inmueble.titulo,
    );

    const verificacion = this.verificacionRepo.create({
      inmuebleId,
      solicitadoPorId,
      archivoTituloUrl,
      textoOcr: textoOcr || 'Documento Folio Real Escaneado',
      resultadoIa: resultIa,
      estado:
        resultIa.estado === 'verificado'
          ? EstadoVerificacion.VERIFICADO
          : resultIa.estado === 'observado'
          ? EstadoVerificacion.OBSERVADO
          : EstadoVerificacion.RECHAZADO,
      scoreConfianza: resultIa.scoreConfianza,
      resumenPublico: resultIa.resumenPublico,
      hashCertificado: resultIa.certificacionHash,
    });

    const savedVerif = await this.verificacionRepo.save(verificacion);

    // Certificar en Blockchain si score >= 85
    if (resultIa.scoreConfianza >= 85) {
      this.blockchainService.recordPropertyRegistration(
        inmuebleId,
        solicitadoPorId,
        resultIa.certificacionHash,
        {
          titulo: inmueble.titulo,
          superficie: inmueble.superficie,
          ciudad: 'La Paz / Santa Cruz / Cochabamba',
          scoreIa: resultIa.scoreConfianza,
        },
      );
    }

    return savedVerif;
  }

  // Citas / Visitas inmobiliarias
  async requestAppointment(
    clienteId: string,
    data: {
      inmuebleId: string;
      fecha: Date;
      horaInicio: string;
      horaFin: string;
      notas?: string;
    },
  ) {
    const inmueble = await this.inmuebleRepo.findOne({ where: { id: data.inmuebleId } });
    if (!inmueble) throw new NotFoundException('Inmueble no encontrado');

    const cita = this.citaRepo.create({
      inmuebleId: data.inmuebleId,
      clienteId,
      propietarioId: inmueble.propietarioId,
      fecha: data.fecha,
      horaInicio: data.horaInicio,
      horaFin: data.horaFin,
      estado: EstadoCita.PENDIENTE,
      notas: data.notas,
    });

    return this.citaRepo.save(cita);
  }

  async getAppointmentsForUser(usuarioId: string) {
    return this.citaRepo.find({
      where: [{ clienteId: usuarioId }, { propietarioId: usuarioId }],
      relations: ['inmueble', 'cliente', 'propietario'],
      order: { fecha: 'ASC' },
    });
  }

  async updateAppointmentStatus(id: string, estado: EstadoCita) {
    await this.citaRepo.update(id, { estado });
    return this.citaRepo.findOne({ where: { id }, relations: ['inmueble', 'cliente', 'propietario'] });
  }

  // Favoritos
  async toggleFavorite(usuarioId: string, inmuebleId: string) {
    const existing = await this.favoritoRepo.findOne({
      where: { usuarioId, inmuebleId },
    });
    if (existing) {
      await this.favoritoRepo.remove(existing);
      return { favorited: false };
    } else {
      const fav = this.favoritoRepo.create({ usuarioId, inmuebleId });
      await this.favoritoRepo.save(fav);
      return { favorited: true };
    }
  }

  async getFavorites(usuarioId: string) {
    return this.favoritoRepo.find({
      where: { usuarioId },
      relations: ['inmueble', 'inmueble.tipo', 'inmueble.direccion', 'inmueble.multimedia', 'inmueble.publicaciones'],
    });
  }
}
