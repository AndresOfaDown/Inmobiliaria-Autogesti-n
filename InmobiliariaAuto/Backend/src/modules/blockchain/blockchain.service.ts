import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

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

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private chain: Block[] = [];
  private pendingTransactions: BlockchainTransaction[] = [];
  private difficulty = 2; // Proof of work difficulty prefix (e.g. "00")

  constructor() {
    this.createGenesisBlock();
  }

  private calculateHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private calculateMerkleRoot(transactions: BlockchainTransaction[]): string {
    if (transactions.length === 0) {
      return this.calculateHash('EMPTY_TRANSACTIONS');
    }
    let hashes = transactions.map((tx) => tx.txHash);
    while (hashes.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < hashes.length; i += 2) {
        if (i + 1 < hashes.length) {
          nextLevel.push(this.calculateHash(hashes[i] + hashes[i + 1]));
        } else {
          nextLevel.push(this.calculateHash(hashes[i] + hashes[i]));
        }
      }
      hashes = nextLevel;
    }
    return hashes[0];
  }

  private createGenesisBlock(): void {
    const genesisTx: BlockchainTransaction = {
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
    const genesisBlock: Block = {
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

  private computeBlockHash(block: Block): string {
    const data = `${block.index}${block.timestamp}${block.merkleRoot}${block.previousHash}${block.nonce}`;
    return this.calculateHash(data);
  }

  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  public minePendingBlock(): Block {
    const previousBlock = this.getLatestBlock();
    const transactionsToMine = [...this.pendingTransactions];
    this.pendingTransactions = [];

    const merkleRoot = this.calculateMerkleRoot(transactionsToMine);
    let nonce = 0;
    let block: Block = {
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

  // 1. Registro Inmueble (Certificación de Titularidad)
  public recordPropertyRegistration(
    inmuebleId: string,
    propietarioId: string,
    hashTituloPropiedad: string,
    metadata: {
      titulo: string;
      superficie: number;
      ciudad: string;
      scoreIa?: number;
    },
  ): BlockchainTransaction {
    const txId = `TX-INM-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const timestamp = new Date().toISOString();
    const payload = {
      inmuebleId,
      propietarioId,
      hashTituloPropiedad,
      metadata,
    };
    const txHash = this.calculateHash(JSON.stringify(payload) + timestamp);

    const tx: BlockchainTransaction = {
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

  // 2. Firmas de Contrato (Timestamp Inmutable)
  public recordContractSignatures(
    contratoId: string,
    propietarioId: string,
    firmaPropietario: string,
    inquilinoId: string,
    firmaInquilino: string,
    monto: number,
    moneda: string,
  ): BlockchainTransaction {
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

    const tx: BlockchainTransaction = {
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

  // 3. Auditoría de Pagos (Stripe Transaction & Ledger)
  public recordPaymentAudit(
    pagoId: string,
    contratoId: string,
    pagadorId: string,
    monto: number,
    moneda: string,
    stripeSessionId?: string,
    stripePaymentIntent?: string,
  ): BlockchainTransaction {
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

    const tx: BlockchainTransaction = {
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

  public getChain(): Block[] {
    return this.chain;
  }

  public verifyChainIntegrity(): { isValid: boolean; checkedBlocks: number; error?: string } {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // Verificar hash previo
      if (current.previousHash !== previous.hash) {
        return {
          isValid: false,
          checkedBlocks: i,
          error: `Corrupción en bloque #${current.index}: previousHash no coincide con hash de #${previous.index}`,
        };
      }

      // Verificar Merkle root
      const calculatedMerkle = this.calculateMerkleRoot(current.transactions);
      if (current.merkleRoot !== calculatedMerkle) {
        return {
          isValid: false,
          checkedBlocks: i,
          error: `Merkle Root alterado en bloque #${current.index}`,
        };
      }

      // Verificar hash del bloque
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

  public getTransactionByTxId(txId: string): { tx: BlockchainTransaction; blockIndex: number; blockHash: string } | null {
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

  public getLedgerStats() {
    let totalTransactions = 0;
    let propRegistrations = 0;
    let contractSignatures = 0;
    let paymentAudits = 0;

    for (const block of this.chain) {
      totalTransactions += block.transactions.length;
      for (const tx of block.transactions) {
        if (tx.type === 'REGISTRO_INMUEBLE') propRegistrations++;
        if (tx.type === 'FIRMA_CONTRATO') contractSignatures++;
        if (tx.type === 'AUDITORIA_PAGO') paymentAudits++;
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
}
