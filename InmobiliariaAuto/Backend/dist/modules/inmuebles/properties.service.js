"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inmueble_entity_1 = require("./entities/inmueble.entity");
const tipo_inmueble_entity_1 = require("./entities/tipo-inmueble.entity");
const direccion_entity_1 = require("./entities/direccion.entity");
const multimedia_entity_1 = require("./entities/multimedia.entity");
const hotspot_entity_1 = require("./entities/hotspot.entity");
const publicacion_entity_1 = require("./entities/publicacion.entity");
const cita_entity_1 = require("./entities/cita.entity");
const horario_disponible_entity_1 = require("./entities/horario-disponible.entity");
const verificacion_titulo_entity_1 = require("./entities/verificacion-titulo.entity");
const acceso_recorrido_entity_1 = require("./entities/acceso-recorrido.entity");
const favorito_entity_1 = require("./entities/favorito.entity");
const blockchain_service_1 = require("../blockchain/blockchain.service");
const ai_service_1 = require("../ia/ai.service");
let PropertiesService = class PropertiesService {
    constructor(inmuebleRepo, tipoRepo, direccionRepo, mediaRepo, hotspotRepo, publicacionRepo, citaRepo, horarioRepo, verificacionRepo, accesoRepo, favoritoRepo, blockchainService, aiService) {
        this.inmuebleRepo = inmuebleRepo;
        this.tipoRepo = tipoRepo;
        this.direccionRepo = direccionRepo;
        this.mediaRepo = mediaRepo;
        this.hotspotRepo = hotspotRepo;
        this.publicacionRepo = publicacionRepo;
        this.citaRepo = citaRepo;
        this.horarioRepo = horarioRepo;
        this.verificacionRepo = verificacionRepo;
        this.accesoRepo = accesoRepo;
        this.favoritoRepo = favoritoRepo;
        this.blockchainService = blockchainService;
        this.aiService = aiService;
    }
    async getTiposInmueble() {
        return this.tipoRepo.find();
    }
    async createTipoInmueble(nombre, descripcion) {
        const tipo = this.tipoRepo.create({ nombre, descripcion });
        return this.tipoRepo.save(tipo);
    }
    async searchProperties(filters) {
        const qb = this.inmuebleRepo
            .createQueryBuilder('inmueble')
            .leftJoinAndSelect('inmueble.tipo', 'tipo')
            .leftJoinAndSelect('inmueble.direccion', 'direccion')
            .leftJoinAndSelect('inmueble.propietario', 'propietario')
            .leftJoinAndSelect('inmueble.multimedia', 'multimedia')
            .leftJoinAndSelect('inmueble.publicaciones', 'publicacion', 'publicacion.estado = :pubEstado', { pubEstado: publicacion_entity_1.EstadoPublicacion.ACTIVA })
            .where('inmueble.estado != :oculto', { oculto: inmueble_entity_1.EstadoInmueble.OCULTO });
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
            qb.andWhere('(LOWER(inmueble.titulo) LIKE LOWER(:search) OR LOWER(inmueble.descripcion) LIKE LOWER(:search) OR LOWER(direccion.zona) LIKE LOWER(:search) OR LOWER(direccion.ciudad) LIKE LOWER(:search))', { search: `%${filters.search}%` });
        }
        qb.orderBy('inmueble.creado', 'DESC');
        return qb.getMany();
    }
    async getPropertyById(id) {
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
            throw new common_1.NotFoundException('Inmueble no encontrado');
        }
        const verificacion = await this.verificacionRepo.findOne({
            where: { inmuebleId: id },
            order: { creado: 'DESC' },
        });
        return {
            ...inmueble,
            verificacionLegal: verificacion || null,
        };
    }
    async getPropertiesByOwner(propietarioId) {
        return this.inmuebleRepo.find({
            where: { propietarioId },
            relations: ['tipo', 'direccion', 'publicaciones', 'multimedia'],
            order: { creado: 'DESC' },
        });
    }
    async createProperty(propietarioId, data) {
        const direccion = this.direccionRepo.create(data.direccion);
        const savedDir = await this.direccionRepo.save(direccion);
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
            estado: inmueble_entity_1.EstadoInmueble.DISPONIBLE,
        });
        const savedInmueble = await this.inmuebleRepo.save(inmueble);
        if (data.publicacion) {
            const pub = this.publicacionRepo.create({
                inmuebleId: savedInmueble.id,
                tipoOferta: data.publicacion.tipoOferta,
                precio: data.publicacion.precio,
                moneda: data.publicacion.moneda || 'USD',
                estado: publicacion_entity_1.EstadoPublicacion.ACTIVA,
            });
            await this.publicacionRepo.save(pub);
        }
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
        const titleHash = `HASH-TIT-${savedInmueble.id.slice(0, 8)}-${Date.now()}`;
        this.blockchainService.recordPropertyRegistration(savedInmueble.id, propietarioId, titleHash, {
            titulo: savedInmueble.titulo,
            superficie: savedInmueble.superficie,
            ciudad: data.direccion.ciudad,
        });
        savedInmueble.hashBlockchain = titleHash;
        await this.inmuebleRepo.save(savedInmueble);
        return this.getPropertyById(savedInmueble.id);
    }
    async updateProperty(id, propietarioId, data) {
        const inmueble = await this.inmuebleRepo.findOne({ where: { id } });
        if (!inmueble)
            throw new common_1.NotFoundException('Inmueble no encontrado');
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
            }
            else {
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
    async deleteProperty(id, propietarioId) {
        const inmueble = await this.inmuebleRepo.findOne({ where: { id } });
        if (!inmueble)
            throw new common_1.NotFoundException('Inmueble no encontrado');
        await this.inmuebleRepo.remove(inmueble);
        return { success: true };
    }
    async addMultimedia(inmuebleId, items) {
        const saved = [];
        for (const item of items) {
            const media = this.mediaRepo.create({ ...item, inmuebleId });
            saved.push(await this.mediaRepo.save(media));
        }
        return saved;
    }
    async deleteMultimedia(mediaId) {
        await this.mediaRepo.delete(mediaId);
        return { success: true };
    }
    async addHotspot(data) {
        const hotspot = this.hotspotRepo.create(data);
        return this.hotspotRepo.save(hotspot);
    }
    async deleteHotspot(id) {
        await this.hotspotRepo.delete(id);
        return { success: true };
    }
    async requestTitleVerification(inmuebleId, solicitadoPorId, archivoTituloUrl, textoOcr) {
        const inmueble = await this.inmuebleRepo.findOne({ where: { id: inmuebleId } });
        if (!inmueble)
            throw new common_1.NotFoundException('Inmueble no encontrado');
        const resultIa = await this.aiService.verifyPropertyDeed(textoOcr || archivoTituloUrl, inmueble.titulo);
        const verificacion = this.verificacionRepo.create({
            inmuebleId,
            solicitadoPorId,
            archivoTituloUrl,
            textoOcr: textoOcr || 'Documento Folio Real Escaneado',
            resultadoIa: resultIa,
            estado: resultIa.estado === 'verificado'
                ? verificacion_titulo_entity_1.EstadoVerificacion.VERIFICADO
                : resultIa.estado === 'observado'
                    ? verificacion_titulo_entity_1.EstadoVerificacion.OBSERVADO
                    : verificacion_titulo_entity_1.EstadoVerificacion.RECHAZADO,
            scoreConfianza: resultIa.scoreConfianza,
            resumenPublico: resultIa.resumenPublico,
            hashCertificado: resultIa.certificacionHash,
        });
        const savedVerif = await this.verificacionRepo.save(verificacion);
        if (resultIa.scoreConfianza >= 85) {
            this.blockchainService.recordPropertyRegistration(inmuebleId, solicitadoPorId, resultIa.certificacionHash, {
                titulo: inmueble.titulo,
                superficie: inmueble.superficie,
                ciudad: 'La Paz / Santa Cruz / Cochabamba',
                scoreIa: resultIa.scoreConfianza,
            });
        }
        return savedVerif;
    }
    async requestAppointment(clienteId, data) {
        const inmueble = await this.inmuebleRepo.findOne({ where: { id: data.inmuebleId } });
        if (!inmueble)
            throw new common_1.NotFoundException('Inmueble no encontrado');
        const cita = this.citaRepo.create({
            inmuebleId: data.inmuebleId,
            clienteId,
            propietarioId: inmueble.propietarioId,
            fecha: data.fecha,
            horaInicio: data.horaInicio,
            horaFin: data.horaFin,
            estado: cita_entity_1.EstadoCita.PENDIENTE,
            notas: data.notas,
        });
        return this.citaRepo.save(cita);
    }
    async getAppointmentsForUser(usuarioId) {
        return this.citaRepo.find({
            where: [{ clienteId: usuarioId }, { propietarioId: usuarioId }],
            relations: ['inmueble', 'cliente', 'propietario'],
            order: { fecha: 'ASC' },
        });
    }
    async updateAppointmentStatus(id, estado) {
        await this.citaRepo.update(id, { estado });
        return this.citaRepo.findOne({ where: { id }, relations: ['inmueble', 'cliente', 'propietario'] });
    }
    async toggleFavorite(usuarioId, inmuebleId) {
        const existing = await this.favoritoRepo.findOne({
            where: { usuarioId, inmuebleId },
        });
        if (existing) {
            await this.favoritoRepo.remove(existing);
            return { favorited: false };
        }
        else {
            const fav = this.favoritoRepo.create({ usuarioId, inmuebleId });
            await this.favoritoRepo.save(fav);
            return { favorited: true };
        }
    }
    async getFavorites(usuarioId) {
        return this.favoritoRepo.find({
            where: { usuarioId },
            relations: ['inmueble', 'inmueble.tipo', 'inmueble.direccion', 'inmueble.multimedia', 'inmueble.publicaciones'],
        });
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inmueble_entity_1.Inmueble)),
    __param(1, (0, typeorm_1.InjectRepository)(tipo_inmueble_entity_1.TipoInmueble)),
    __param(2, (0, typeorm_1.InjectRepository)(direccion_entity_1.Direccion)),
    __param(3, (0, typeorm_1.InjectRepository)(multimedia_entity_1.Multimedia)),
    __param(4, (0, typeorm_1.InjectRepository)(hotspot_entity_1.Hotspot)),
    __param(5, (0, typeorm_1.InjectRepository)(publicacion_entity_1.Publicacion)),
    __param(6, (0, typeorm_1.InjectRepository)(cita_entity_1.Cita)),
    __param(7, (0, typeorm_1.InjectRepository)(horario_disponible_entity_1.HorarioDisponible)),
    __param(8, (0, typeorm_1.InjectRepository)(verificacion_titulo_entity_1.VerificacionTitulo)),
    __param(9, (0, typeorm_1.InjectRepository)(acceso_recorrido_entity_1.AccesoRecorrido360)),
    __param(10, (0, typeorm_1.InjectRepository)(favorito_entity_1.Favorito)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        blockchain_service_1.BlockchainService,
        ai_service_1.AiService])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map