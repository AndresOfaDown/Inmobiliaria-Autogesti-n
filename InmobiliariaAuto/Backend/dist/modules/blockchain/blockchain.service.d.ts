export interface BlockchainTransaction {
    txId: string;
    type: 'REGISTRO_INMUEBLE' | 'FIRMA_CONTRATO' | 'AUDITORIA_PAGO';
    timestamp: string;
    payload: any;
    signature?: string;
    txHash: string;
}
export interface Block {
    index: number;
    timestamp: string;
    transactions: BlockchainTransaction[];
    previousHash: string;
    merkleRoot: string;
    hash: string;
    nonce: number;
}
export declare class BlockchainService {
    private readonly logger;
    private chain;
    private pendingTransactions;
    private difficulty;
    constructor();
    private calculateHash;
    private calculateMerkleRoot;
    private createGenesisBlock;
    private computeBlockHash;
    getLatestBlock(): Block;
    minePendingBlock(): Block;
    recordPropertyRegistration(inmuebleId: string, propietarioId: string, hashTituloPropiedad: string, metadata: {
        titulo: string;
        superficie: number;
        ciudad: string;
        scoreIa?: number;
    }): BlockchainTransaction;
    recordContractSignatures(contratoId: string, propietarioId: string, firmaPropietario: string, inquilinoId: string, firmaInquilino: string, monto: number, moneda: string): BlockchainTransaction;
    recordPaymentAudit(pagoId: string, contratoId: string, pagadorId: string, monto: number, moneda: string, stripeSessionId?: string, stripePaymentIntent?: string): BlockchainTransaction;
    getChain(): Block[];
    verifyChainIntegrity(): {
        isValid: boolean;
        checkedBlocks: number;
        error?: string;
    };
    getTransactionByTxId(txId: string): {
        tx: BlockchainTransaction;
        blockIndex: number;
        blockHash: string;
    } | null;
    getLedgerStats(): {
        totalBlocks: number;
        totalTransactions: number;
        propRegistrations: number;
        contractSignatures: number;
        paymentAudits: number;
        latestBlockHash: string;
        chainValid: boolean;
    };
}
