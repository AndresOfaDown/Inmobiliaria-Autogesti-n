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
var BlockchainService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
let BlockchainService = BlockchainService_1 = class BlockchainService {
    constructor() {
        this.logger = new common_1.Logger(BlockchainService_1.name);
        this.chain = [];
        this.pendingTransactions = [];
        this.difficulty = 2;
        this.createGenesisBlock();
    }
    calculateHash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    calculateMerkleRoot(transactions) {
        if (transactions.length === 0) {
            return this.calculateHash('EMPTY_TRANSACTIONS');
        }
        let hashes = transactions.map((tx) => tx.txHash);
        while (hashes.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < hashes.length; i += 2) {
                if (i + 1 < hashes.length) {
                    nextLevel.push(this.calculateHash(hashes[i] + hashes[i + 1]));
                }
                else {
                    nextLevel.push(this.calculateHash(hashes[i] + hashes[i]));
                }
            }
            hashes = nextLevel;
        }
        return hashes[0];
    }
    createGenesisBlock() {
        const genesisTx = {
            txId: 'TX-GENESIS-000000000000',
            type: 'REGISTRO_INMUEBLE',
            timestamp: new Date('2026-01-01T00:00:00.000Z').toISOString(),
            payload: {
                description: 'Bloque Génesis de Certificación Inmobiliaria Descentralizada',
                protocolVersion: '1.0.0-PROD',
                system: 'Autogestión Inmobiliaria Inteligente',
            },
            txHash: this.calculateHash('GENESIS_PAYLOAD_INIT_2026'),
        };
        const merkle = this.calculateMerkleRoot([genesisTx]);
        const genesisBlock = {
            index: 0,
            timestamp: new Date('2026-01-01T00:00:00.000Z').toISOString(),
            transactions: [genesisTx],
            previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
            merkleRoot: merkle,
            hash: '',
            nonce: 0,
        };
        genesisBlock.hash = this.computeBlockHash(genesisBlock);
        this.chain.push(genesisBlock);
        this.logger.log(`Genesis Block initialized with hash: ${genesisBlock.hash}`);
    }
    computeBlockHash(block) {
        const data = `${block.index}${block.timestamp}${block.merkleRoot}${block.previousHash}${block.nonce}`;
        return this.calculateHash(data);
    }
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    minePendingBlock() {
        const previousBlock = this.getLatestBlock();
        const transactionsToMine = [...this.pendingTransactions];
        this.pendingTransactions = [];
        const merkleRoot = this.calculateMerkleRoot(transactionsToMine);
        let nonce = 0;
        let block = {
            index: previousBlock.index + 1,
            timestamp: new Date().toISOString(),
            transactions: transactionsToMine,
            previousHash: previousBlock.hash,
            merkleRoot,
            hash: '',
            nonce,
        };
        const targetPrefix = '0'.repeat(this.difficulty);
        let hash = '';
        do {
            block.nonce = nonce++;
            hash = this.computeBlockHash(block);
        } while (!hash.startsWith(targetPrefix));
        block.hash = hash;
        this.chain.push(block);
        this.logger.log(`Nuevo bloque minado #${block.index} [Hash: ${block.hash}] con ${transactionsToMine.length} transacciones`);
        return block;
    }
    recordPropertyRegistration(inmuebleId, propietarioId, hashTituloPropiedad, metadata) {
        const txId = `TX-INM-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const timestamp = new Date().toISOString();
        const payload = {
            inmuebleId,
            propietarioId,
            hashTituloPropiedad,
            metadata,
        };
        const txHash = this.calculateHash(JSON.stringify(payload) + timestamp);
        const tx = {
            txId,
            type: 'REGISTRO_INMUEBLE',
            timestamp,
            payload,
            txHash,
        };
        this.pendingTransactions.push(tx);
        this.minePendingBlock();
        return tx;
    }
    recordContractSignatures(contratoId, propietarioId, firmaPropietario, inquilinoId, firmaInquilino, monto, moneda) {
        const txId = `TX-CTR-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const timestamp = new Date().toISOString();
        const payload = {
            contratoId,
            propietarioId,
            firmaPropietarioHash: this.calculateHash(firmaPropietario),
            inquilinoId,
            firmaInquilinoHash: this.calculateHash(firmaInquilino),
            monto,
            moneda,
            firmadoEn: timestamp,
        };
        const txHash = this.calculateHash(JSON.stringify(payload) + timestamp);
        const tx = {
            txId,
            type: 'FIRMA_CONTRATO',
            timestamp,
            payload,
            txHash,
        };
        this.pendingTransactions.push(tx);
        this.minePendingBlock();
        return tx;
    }
    recordPaymentAudit(pagoId, contratoId, pagadorId, monto, moneda, stripeSessionId, stripePaymentIntent) {
        const txId = `TX-PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const timestamp = new Date().toISOString();
        const payload = {
            pagoId,
            contratoId,
            pagadorId,
            monto,
            moneda,
            stripeSessionId: stripeSessionId || 'MOCK-SESSION-OFFLINE',
            stripePaymentIntent: stripePaymentIntent || 'PI-MOCK-OFFLINE',
            registradoEn: timestamp,
        };
        const txHash = this.calculateHash(JSON.stringify(payload) + timestamp);
        const tx = {
            txId,
            type: 'AUDITORIA_PAGO',
            timestamp,
            payload,
            txHash,
        };
        this.pendingTransactions.push(tx);
        this.minePendingBlock();
        return tx;
    }
    getChain() {
        return this.chain;
    }
    verifyChainIntegrity() {
        for (let i = 1; i < this.chain.length; i++) {
            const current = this.chain[i];
            const previous = this.chain[i - 1];
            if (current.previousHash !== previous.hash) {
                return {
                    isValid: false,
                    checkedBlocks: i,
                    error: `Corrupción en bloque #${current.index}: previousHash no coincide con hash de #${previous.index}`,
                };
            }
            const calculatedMerkle = this.calculateMerkleRoot(current.transactions);
            if (current.merkleRoot !== calculatedMerkle) {
                return {
                    isValid: false,
                    checkedBlocks: i,
                    error: `Merkle Root alterado en bloque #${current.index}`,
                };
            }
            const calculatedHash = this.computeBlockHash(current);
            if (current.hash !== calculatedHash) {
                return {
                    isValid: false,
                    checkedBlocks: i,
                    error: `Hash inválido en bloque #${current.index}`,
                };
            }
        }
        return {
            isValid: true,
            checkedBlocks: this.chain.length,
        };
    }
    getTransactionByTxId(txId) {
        for (const block of this.chain) {
            const found = block.transactions.find((t) => t.txId === txId);
            if (found) {
                return {
                    tx: found,
                    blockIndex: block.index,
                    blockHash: block.hash,
                };
            }
        }
        return null;
    }
    getLedgerStats() {
        let totalTransactions = 0;
        let propRegistrations = 0;
        let contractSignatures = 0;
        let paymentAudits = 0;
        for (const block of this.chain) {
            totalTransactions += block.transactions.length;
            for (const tx of block.transactions) {
                if (tx.type === 'REGISTRO_INMUEBLE')
                    propRegistrations++;
                if (tx.type === 'FIRMA_CONTRATO')
                    contractSignatures++;
                if (tx.type === 'AUDITORIA_PAGO')
                    paymentAudits++;
            }
        }
        return {
            totalBlocks: this.chain.length,
            totalTransactions,
            propRegistrations,
            contractSignatures,
            paymentAudits,
            latestBlockHash: this.getLatestBlock().hash,
            chainValid: this.verifyChainIntegrity().isValid,
        };
    }
};
exports.BlockchainService = BlockchainService;
exports.BlockchainService = BlockchainService = BlockchainService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BlockchainService);
//# sourceMappingURL=blockchain.service.js.map