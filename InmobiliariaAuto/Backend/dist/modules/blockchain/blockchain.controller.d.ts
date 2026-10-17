import { BlockchainService } from './blockchain.service';
export declare class BlockchainController {
    private readonly blockchainService;
    constructor(blockchainService: BlockchainService);
    getLedger(): {
        chain: import("./blockchain.service").Block[];
        stats: {
            totalBlocks: number;
            totalTransactions: number;
            propRegistrations: number;
            contractSignatures: number;
            paymentAudits: number;
            latestBlockHash: string;
            chainValid: boolean;
        };
    };
    verifyIntegrity(): {
        isValid: boolean;
        checkedBlocks: number;
        error?: string;
    };
    getStats(): {
        totalBlocks: number;
        totalTransactions: number;
        propRegistrations: number;
        contractSignatures: number;
        paymentAudits: number;
        latestBlockHash: string;
        chainValid: boolean;
    };
    getTransaction(txId: string): {
        tx: import("./blockchain.service").BlockchainTransaction;
        blockIndex: number;
        blockHash: string;
    } | {
        error: string;
    };
}
