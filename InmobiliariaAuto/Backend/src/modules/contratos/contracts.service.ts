import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Contrato, EstadoContrato } from './entities/contrato.entity';
import { TipoContrato } from './entities/tipo-contrato.entity';
import { Comision } from './entities/comision.entity';
import { Inmueble } from '../inmuebles/entities/inmueble.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { UsersService } from '../usuarios/users.service';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contrato)
    private contratoRepo: Repository<Contrato>,
    @InjectRepository(TipoContrato)
    private tipoContratoRepo: Repository<TipoContrato>,
    @InjectRepository(Comision)
    private comisionRepo: Repository<Comision>,
    @InjectRepository(Inmueble)
    private inmuebleRepo: Repository<Inmueble>,
    private blockchainService: BlockchainService,
    private usersService: UsersService,
  ) {}

  // Tipos de contrato
  async getTiposContrato() {
    return this.tipoContratoRepo.find();
  }

  async createTipoContrato(nombre: string, descripcion?: string) {
    const item = this.tipoContratoRepo.create({ nombre, descripcion });
    return this.tipoContratoRepo.save(item);
  }

  // Listar contratos de un usuario (sea inquilino o propietario del inmueble)
  async getMyContracts(usuarioId: string) {
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

  // Todos los contratos (Admin)
  async getAllContracts() {
    return this.contratoRepo.find({
      relations: ['inmueble', 'inmueble.propietario', 'inquilino', 'tipoContrato', 'comisiones'],
      order: { creado: 'DESC' },
    });
  }

  async getContractById(id: string) {
    const contrato = await this.contratoRepo.findOne({
      where: { id },
      relations: ['inmueble', 'inmueble.propietario', 'inquilino', 'tipoContrato', 'comisiones'],
    });
    if (!contrato) throw new NotFoundException('Contrato no encontrado');
    return contrato;
  }

  // Crear contrato
  async createContract(data: Partial<Contrato>) {
    const inmueble = await this.inmuebleRepo.findOne({ where: { id: data.inmuebleId } });
    if (!inmueble) throw new NotFoundException('Inmueble no encontrado');

    const contrato = this.contratoRepo.create({
      ...data,
      estado: EstadoContrato.BORRADOR,
    });

    const saved = await this.contratoRepo.save(contrato);

    // Notificar al inquilino
    await this.usersService.createNotification(
      data.inquilinoId,
      'Nuevo Contrato Emitido',
      `Se ha redactado una propuesta de contrato para el inmueble "${inmueble.titulo}". Revisa las cláusulas y fírmalo digitalmente.`,
    );

    return this.getContractById(saved.id);
  }

  // Firmar digitalmente el contrato
  async signContract(
    contratoId: string,
    usuarioId: string,
    firmaBase64: string,
  ) {
    const contrato = await this.getContractById(contratoId);

    const isPropietario = contrato.inmueble.propietarioId === usuarioId;
    const isInquilino = contrato.inquilinoId === usuarioId;

    if (!isPropietario && !isInquilino) {
      throw new BadRequestException('No tienes autorización para firmar este contrato');
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

    // Si ambas partes firmaron, se activa el contrato y se asienta en Blockchain
    if (contrato.firmaPropietario && contrato.firmaInquilino) {
      contrato.estado = EstadoContrato.ACTIVO;

      // Asentar en Blockchain inmutable
      const tx = this.blockchainService.recordContractSignatures(
        contrato.id,
        contrato.inmueble.propietarioId,
        contrato.firmaPropietario,
        contrato.inquilinoId,
        contrato.firmaInquilino,
        Number(contrato.monto),
        contrato.moneda,
      );

      contrato.blockchainTxId = tx.txId;
      contrato.blockchainHash = tx.txHash;
      contrato.blockchainBlockNumber = this.blockchainService.getLatestBlock().index;

      // Crear comisión preliminar de la plataforma (ej. 5%)
      const montoComision = (Number(contrato.monto) * 5) / 100;
      const comision = this.comisionRepo.create({
        contratoId: contrato.id,
        contrato: { id: contrato.id } as any,
        porcentaje: 5.0,
        monto: montoComision,
        pagada: false,
        descripcion: `Comisión de intermediación segura (5%) sobre contrato ${contrato.id.slice(0, 8)}`,
      });
      await this.comisionRepo.save(comision);

      // Notificaciones a ambas partes
      await this.usersService.createNotification(
        contrato.inmueble.propietarioId,
        'Contrato Firmado y Certificado en Blockchain',
        `El contrato para "${contrato.inmueble.titulo}" ha sido firmado por ambas partes y certificado en el bloque #${contrato.blockchainBlockNumber}. TxID: ${tx.txId}`,
      );

      await this.usersService.createNotification(
        contrato.inquilinoId,
        'Contrato Activo y Certificado en Blockchain',
        `Tu contrato para "${contrato.inmueble.titulo}" está activo. Ya puedes realizar el pago del alquiler de forma segura. TxID: ${tx.txId}`,
      );
    } else {
      contrato.estado = EstadoContrato.ENVIADO;
    }

    delete (contrato as any).comisiones;
    await this.contratoRepo.save(contrato);
    return this.getContractById(contrato.id);
  }

  // Rechazar contrato
  async rejectContract(contratoId: string, usuarioId: string, motivo: string) {
    const contrato = await this.getContractById(contratoId);
    contrato.estado = EstadoContrato.RECHAZADO;
    contrato.motivoRechazo = motivo;
    await this.contratoRepo.save(contrato);
    return contrato;
  }
}
