import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
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

    const item = await this.transactionItemRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Transaction item with ID "${id}" not found`);
    }

    const hasTransactions = await this.transactionRepository.existsByTransactionItemId(id);
    if (hasTransactions) {
      throw new BadRequestException('Cannot delete transaction item because it is used by one or more transactions');
    }

    await this.transactionItemRepository.delete(id);
  }
}
