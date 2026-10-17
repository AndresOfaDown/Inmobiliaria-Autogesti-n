import { ContractsService } from './contracts.service';
export declare class ContractsController {
    private readonly contractsService;
    constructor(contractsService: ContractsService);
    getTipos(): Promise<import("./entities/tipo-contrato.entity").TipoContrato[]>;
    createTipo(body: {
        nombre: string;
        descripcion?: string;
    }): Promise<import("./entities/tipo-contrato.entity").TipoContrato>;
    getMyContracts(user: any): Promise<import("./entities/contrato.entity").Contrato[]>;
    getAllContracts(): Promise<import("./entities/contrato.entity").Contrato[]>;
    getContractById(id: string): Promise<import("./entities/contrato.entity").Contrato>;
    createContract(data: any): Promise<import("./entities/contrato.entity").Contrato>;
    signContract(id: string, user: any, body: {
        firmaBase64: string;
    }): Promise<import("./entities/contrato.entity").Contrato>;
    rejectContract(id: string, user: any, body: {
        motivo: string;
    }): Promise<import("./entities/contrato.entity").Contrato>;
}
