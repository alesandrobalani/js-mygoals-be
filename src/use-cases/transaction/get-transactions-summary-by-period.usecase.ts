import { Inject, Injectable, Logger } from '@nestjs/common';
import { TransactionRepository, TransactionByTypeSummary } from '../../domain/repositories/transaction.repository';

@Injectable()
export class GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase {
  private readonly logger = new Logger(GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase.name);

  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(startDate: Date, endDate: Date): Promise<TransactionByTypeSummary> {
    this.logger.log(`Retrieving transaction summary from ${startDate} to ${endDate}`, 'GetTransactionsSummaryByPeriodUseCase');

    try {
      const summary = await this.transactionRepository.findSumByPeriodGroupByType(startDate, endDate);
      this.logger.log(`Summary retrieved: income=${summary.income}, expense=${summary.expense}`, 'GetTransactionsSummaryByPeriodUseCase');
      return summary;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve transaction summary: ${errorMessage}`, errorStack, 'GetTransactionsSummaryByPeriodUseCase');
      throw error;
    }
  }
}
