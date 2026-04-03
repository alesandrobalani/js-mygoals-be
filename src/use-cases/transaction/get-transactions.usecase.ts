import { Inject, Injectable, Logger } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionRepository } from '../../domain/repositories/transaction.repository';

@Injectable()
export class GetTransactionsUseCase {
  private readonly logger = new Logger(GetTransactionsUseCase.name);

  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(): Promise<Transaction[]> {
    this.logger.log('Retrieving all transactions', 'GetTransactionsUseCase');

    try {
      const transactions = await this.transactionRepository.findAll();
      this.logger.log(`Retrieved ${transactions.length} transactions`, 'GetTransactionsUseCase');
      return transactions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve transactions: ${errorMessage}`, errorStack, 'GetTransactionsUseCase');
      throw error;
    }
  }
}
