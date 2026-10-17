import { Repository } from 'typeorm';
import { Contrato } from './entities/contrato.entity';
import { TipoContrato } from './entities/tipo-contrato.entity';
import { Comision } from './entities/comision.entity';
import { Inmueble } from '../inmuebles/entities/inmueble.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { UsersService } from '../usuarios/users.service';
export declare class ContractsService {
    private contratoRepo;
    private tipoContratoRepo;
    private comisionRepo;
    private inmuebleRepo;
    private blockchainService;
    private usersService;
    constructor(contratoRepo: Repository<Contrato>, tipoContratoRepo: Repository<TipoContrato>, comisionRepo: Repository<Comision>, inmuebleRepo: Repository<Inmueble>, blockchainService: BlockchainService, usersService: UsersService);
    getTiposContrato(): Promise<TipoContrato[]>;
    createTipoContrato(nombre: string, descripcion?: string): Promise<TipoContrato>;
    getMyContracts(usuarioId: string): Promise<Contrato[]>;
    getAllContracts(): Promise<Contrato[]>;
    getContractById(id: string): Promise<Contrato>;
    createContract(data: Partial<Contrato>): Promise<Contrato>;
    signContract(contratoId: string, usuarioId: string, firmaBase64: string): Promise<Contrato>;
    rejectContract(contratoId: string, usuarioId: string, motivo: string): Promise<Contrato>;
}
