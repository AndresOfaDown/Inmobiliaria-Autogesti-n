import { Controller, Get, Param } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('ledger')
  getLedger() {
    return {
      chain: this.blockchainService.getChain(),
      stats: this.blockchainService.getLedgerStats(),
    };
  }

  @Get('verify')
  verifyIntegrity() {
    return this.blockchainService.verifyChainIntegrity();
  }

  @Get('stats')
  getStats() {
    return this.blockchainService.getLedgerStats();
  }

  @Get('transaction/:txId')
  getTransaction(@Param('txId') txId: string) {
    const result = this.blockchainService.getTransactionByTxId(txId);
    if (!result) {
      return { error: 'Transacción no encontrada en el Ledger' };
    }
    return result;
  }
}
