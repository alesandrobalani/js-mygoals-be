import { Inject, Injectable, Logger } from '@nestjs/common';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { TransactionItemRepository } from '../../domain/repositories/transaction-item.repository';

@Injectable()
export class GetTransactionItemsUseCase {
  private readonly logger = new Logger(GetTransactionItemsUseCase.name);

  constructor(
    @Inject('TransactionItemRepository')
    private readonly transactionItemRepository: TransactionItemRepository,
  ) {}

  async execute(): Promise<TransactionItem[]> {
    this.logger.log('Retrieving all transaction items', 'GetTransactionItemsUseCase');
    return this.transactionItemRepository.findAll();
  }
}
