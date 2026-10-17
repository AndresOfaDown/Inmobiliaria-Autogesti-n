import { ConfigService } from '@nestjs/config';
export interface ContractGenerationInput {
    tipoContrato: string;
    inmuebleTitulo: string;
    direccion: string;
    superficie: number;
    propietarioNombre: string;
    propietarioCi: string;
    inquilinoNombre: string;
    inquilinoCi: string;
    monto: number;
    moneda: string;
    deposito: number;
    diaPago: number;
    inicio: string;
    fin: string;
    incluyeServicios?: string;
    restricciones?: string;
    clausulasEspeciales?: string;
}
export interface TitleVerificationResult {
    scoreConfianza: number;
    estado: 'verificado' | 'observado' | 'rechazado';
    matriculaFolio: string;
    titularRegistral: string;
    superficieRegistrada: string;
    ubicacionRegistrada: string;
    gravamenes: Array<{
        tipo: string;
        descripcion: string;
        riesgo: 'BAJO' | 'MEDIO' | 'ALTO';
    }>;
    resumenLegal: string;
    resumenPublico: string;
    certificacionHash: string;
}
export declare class AiService {
    private configService;
    private readonly logger;
    private groqApiKey;
    private openaiApiKey;
    constructor(configService: ConfigService);
    generateLegalContract(data: ContractGenerationInput): Promise<{
        clausulas: string;
        condicionesUso: string;
        penalidades: string;
        politicaCancelacion: string;
        contratoCompleto: string;
    }>;
    private callExternalLlm;
    private parseLlmContractResponse;
    private generateTemplateContract;
    verifyPropertyDeed(rawTextOrUrl: string, inmuebleTitulo: string): Promise<TitleVerificationResult>;
}
