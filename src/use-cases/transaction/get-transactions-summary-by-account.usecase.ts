import { Inject, Injectable, Logger } from '@nestjs/common';
import { TransactionRepository, TransactionByAccountAndTypeAndSettledSummary } from '../../domain/repositories/transaction.repository';

@Injectable()
export class GetTransactionsSummaryByAccountByTransactionTypeUseCase {
  private readonly logger = new Logger(GetTransactionsSummaryByAccountByTransactionTypeUseCase.name);

  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(endDate: Date): Promise<TransactionByAccountAndTypeAndSettledSummary[]> {
    this.logger.log(`Retrieving transaction summary for account up to ${endDate}`, 'GetTransactionsSummaryByAccountByTransactionTypeUseCase');

    try {
      const summary = await this.transactionRepository.findSumGroupByAccountAndTypeAndSettled(endDate);
      this.logger.log(`Summary retrieved: ${JSON.stringify(summary)}`, 'GetTransactionsSummaryByAccountByTransactionTypeUseCase');
      return summary;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve transaction summary: ${errorMessage}`, errorStack, 'GetTransactionsSummaryByAccountByTransactionTypeUseCase');
      throw error;
    }
  }
}
