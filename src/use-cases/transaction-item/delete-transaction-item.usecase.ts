import { Inject, Injectable, Logger } from '@nestjs/common';
import { TransactionItemRepository } from '../../domain/repositories/transaction-item.repository';
import { TransactionRepository } from '../../domain/repositories/transaction.repository';

@Injectable()
export class DeleteTransactionItemUseCase {
  private readonly logger = new Logger(DeleteTransactionItemUseCase.name);

  constructor(
    @Inject('TransactionItemRepository')
    private readonly transactionItemRepository: TransactionItemRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.log(`Deleting transaction item: ${id}`, 'DeleteTransactionItemUseCase');

    const transactions = await this.transactionRepository.findByTransactionItemId(id);
    if (transactions.length > 0) {
      throw new Error('Cannot delete transaction item because it is used by one or more transactions');
    }

    await this.transactionItemRepository.delete(id);
  }
}
