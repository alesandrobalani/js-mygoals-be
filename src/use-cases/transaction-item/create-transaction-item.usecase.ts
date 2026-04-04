import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateTransactionItemDto } from '../../dto/create-transaction-item.dto';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { TransactionItemRepository } from '../../domain/repositories/transaction-item.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateTransactionItemUseCase {
  private readonly logger = new Logger(CreateTransactionItemUseCase.name);

  constructor(
    @Inject('TransactionItemRepository')
    private readonly transactionItemRepository: TransactionItemRepository,
  ) {}

  async execute(payload: CreateTransactionItemDto): Promise<TransactionItem> {
    this.logger.log(`Creating transaction item: ${payload.name}`, 'CreateTransactionItemUseCase');

    const existing = await this.transactionItemRepository.findByName(payload.name);
    if (existing) {
      throw new Error(`Transaction item with name "${payload.name}" already exists`);
    }

    const item = new TransactionItem(
      randomUUID(),
      payload.name,
      payload.description,
      new Date(),
    );

    return this.transactionItemRepository.create(item);
  }
}
