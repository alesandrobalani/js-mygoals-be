import { Inject, Injectable, Logger } from '@nestjs/common';
import { TransactionRepository, PaginatedTransactions } from '../../domain/repositories/transaction.repository';

@Injectable()
export class FindTransactionsByPeriodUseCase {
  private readonly logger = new Logger(FindTransactionsByPeriodUseCase.name);

  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(startDate: Date, endDate: Date, page: number, limit: number): Promise<PaginatedTransactions> {
    this.logger.log(
      `Searching transactions from ${startDate} to ${endDate} - page=${page}, limit=${limit}`,
      'FindTransactionsByPeriodUseCase',
    );

    try {
      const result = await this.transactionRepository.findByPeriod(startDate, endDate, page, limit);
      this.logger.log(
        `Found ${result.total} transactions (page ${result.page}/${result.totalPages})`,
        'FindTransactionsByPeriodUseCase',
      );
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to search transactions: ${errorMessage}`, errorStack, 'FindTransactionsByPeriodUseCase');
      throw error;
    }
  }
}
