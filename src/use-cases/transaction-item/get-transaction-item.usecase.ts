import { Inject, Injectable, Logger } from '@nestjs/common';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { TransactionItemRepository } from '../../domain/repositories/transaction-item.repository';

@Injectable()
export class GetTransactionItemUseCase {
  private readonly logger = new Logger(GetTransactionItemUseCase.name);

  constructor(
    @Inject('TransactionItemRepository')
    private readonly transactionItemRepository: TransactionItemRepository,
  ) {}

  async execute(id: string): Promise<TransactionItem> {
    this.logger.log(`Retrieving transaction item by ID: ${id}`, 'GetTransactionItemUseCase');

    const item = await this.transactionItemRepository.findById(id);
    if (!item) {
      throw new Error(`Transaction item with ID "${id}" not found`);
    }

    return item;
  }
}
