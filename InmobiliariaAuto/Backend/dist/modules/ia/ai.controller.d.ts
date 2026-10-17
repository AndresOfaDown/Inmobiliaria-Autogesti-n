import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    generarContrato(body: any): Promise<{
        clausulas: string;
        condicionesUso: string;
        penalidades: string;
        politicaCancelacion: string;
        contratoCompleto: string;
    }>;
    verificarTitulo(body: {
        textoOcr: string;
        inmuebleTitulo: string;
    }): Promise<import("./ai.service").TitleVerificationResult>;
}
