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
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contrato_entity_1 = require("./entities/contrato.entity");
const tipo_contrato_entity_1 = require("./entities/tipo-contrato.entity");
const comision_entity_1 = require("./entities/comision.entity");
const inmueble_entity_1 = require("../inmuebles/entities/inmueble.entity");
const blockchain_service_1 = require("../blockchain/blockchain.service");
const users_service_1 = require("../usuarios/users.service");
let ContractsService = class ContractsService {
    constructor(contratoRepo, tipoContratoRepo, comisionRepo, inmuebleRepo, blockchainService, usersService) {
        this.contratoRepo = contratoRepo;
        this.tipoContratoRepo = tipoContratoRepo;
        this.comisionRepo = comisionRepo;
        this.inmuebleRepo = inmuebleRepo;
        this.blockchainService = blockchainService;
        this.usersService = usersService;
    }
    async getTiposContrato() {
        return this.tipoContratoRepo.find();
    }
    async createTipoContrato(nombre, descripcion) {
        const item = this.tipoContratoRepo.create({ nombre, descripcion });
        return this.tipoContratoRepo.save(item);
    }
    async getMyContracts(usuarioId) {
        return this.contratoRepo
            .createQueryBuilder('contrato')
            .leftJoinAndSelect('contrato.inmueble', 'inmueble')
            .leftJoinAndSelect('inmueble.propietario', 'propietario')
            .leftJoinAndSelect('contrato.inquilino', 'inquilino')
            .leftJoinAndSelect('contrato.tipoContrato', 'tipoContrato')
            .leftJoinAndSelect('contrato.comisiones', 'comisiones')
            .where('contrato.inquilinoId = :userId OR inmueble.propietarioId = :userId', {
            userId: usuarioId,
        })
            .orderBy('contrato.creado', 'DESC')
            .getMany();
    }
    async getAllContracts() {
        return this.contratoRepo.find({
            relations: ['inmueble', 'inmueble.propietario', 'inquilino', 'tipoContrato', 'comisiones'],
            order: { creado: 'DESC' },
        });
    }
    async getContractById(id) {
        const contrato = await this.contratoRepo.findOne({
            where: { id },
            relations: ['inmueble', 'inmueble.propietario', 'inquilino', 'tipoContrato', 'comisiones'],
        });
        if (!contrato)
            throw new common_1.NotFoundException('Contrato no encontrado');
        return contrato;
    }
    async createContract(data) {
        const inmueble = await this.inmuebleRepo.findOne({ where: { id: data.inmuebleId } });
        if (!inmueble)
            throw new common_1.NotFoundException('Inmueble no encontrado');
        const contrato = this.contratoRepo.create({
            ...data,
            estado: contrato_entity_1.EstadoContrato.BORRADOR,
        });
        const saved = await this.contratoRepo.save(contrato);
        await this.usersService.createNotification(data.inquilinoId, 'Nuevo Contrato Emitido', `Se ha redactado una propuesta de contrato para el inmueble "${inmueble.titulo}". Revisa las cláusulas y fírmalo digitalmente.`);
        return this.getContractById(saved.id);
    }
    async signContract(contratoId, usuarioId, firmaBase64) {
        const contrato = await this.getContractById(contratoId);
        const isPropietario = contrato.inmueble.propietarioId === usuarioId;
        const isInquilino = contrato.inquilinoId === usuarioId;
        if (!isPropietario && !isInquilino) {
            throw new common_1.BadRequestException('No tienes autorización para firmar este contrato');
        }
        const now = new Date();
        if (isPropietario) {
            contrato.firmaPropietario = firmaBase64;
            contrato.fechaFirmaPropietario = now;
        }
        if (isInquilino) {
            contrato.firmaInquilino = firmaBase64;
            contrato.fechaFirmaInquilino = now;
        }
        if (contrato.firmaPropietario && contrato.firmaInquilino) {
            contrato.estado = contrato_entity_1.EstadoContrato.ACTIVO;
            const tx = this.blockchainService.recordContractSignatures(contrato.id, contrato.inmueble.propietarioId, contrato.firmaPropietario, contrato.inquilinoId, contrato.firmaInquilino, Number(contrato.monto), contrato.moneda);
            contrato.blockchainTxId = tx.txId;
            contrato.blockchainHash = tx.txHash;
            contrato.blockchainBlockNumber = this.blockchainService.getLatestBlock().index;
            const montoComision = (Number(contrato.monto) * 5) / 100;
            const comision = this.comisionRepo.create({
                contratoId: contrato.id,
                contrato: { id: contrato.id },
                porcentaje: 5.0,
                monto: montoComision,
                pagada: false,
                descripcion: `Comisión de intermediación segura (5%) sobre contrato ${contrato.id.slice(0, 8)}`,
            });
            await this.comisionRepo.save(comision);
            await this.usersService.createNotification(contrato.inmueble.propietarioId, 'Contrato Firmado y Certificado en Blockchain', `El contrato para "${contrato.inmueble.titulo}" ha sido firmado por ambas partes y certificado en el bloque #${contrato.blockchainBlockNumber}. TxID: ${tx.txId}`);
            await this.usersService.createNotification(contrato.inquilinoId, 'Contrato Activo y Certificado en Blockchain', `Tu contrato para "${contrato.inmueble.titulo}" está activo. Ya puedes realizar el pago del alquiler de forma segura. TxID: ${tx.txId}`);
        }
        else {
            contrato.estado = contrato_entity_1.EstadoContrato.ENVIADO;
        }
        delete contrato.comisiones;
        await this.contratoRepo.save(contrato);
        return this.getContractById(contrato.id);
    }
    async rejectContract(contratoId, usuarioId, motivo) {
        const contrato = await this.getContractById(contratoId);
        contrato.estado = contrato_entity_1.EstadoContrato.RECHAZADO;
        contrato.motivoRechazo = motivo;
        await this.contratoRepo.save(contrato);
        return contrato;
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contrato_entity_1.Contrato)),
    __param(1, (0, typeorm_1.InjectRepository)(tipo_contrato_entity_1.TipoContrato)),
    __param(2, (0, typeorm_1.InjectRepository)(comision_entity_1.Comision)),
    __param(3, (0, typeorm_1.InjectRepository)(inmueble_entity_1.Inmueble)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        blockchain_service_1.BlockchainService,
        users_service_1.UsersService])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map