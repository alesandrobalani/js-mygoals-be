import { Inject, Injectable, Logger } from '@nestjs/common';
import { UpdateTransactionItemDto } from '../../dto/update-transaction-item.dto';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { TransactionItemRepository } from '../../domain/repositories/transaction-item.repository';

@Injectable()
export class UpdateTransactionItemUseCase {
  private readonly logger = new Logger(UpdateTransactionItemUseCase.name);

  constructor(
    @Inject('TransactionItemRepository')
    private readonly transactionItemRepository: TransactionItemRepository,
  ) {}

  async execute(id: string, payload: UpdateTransactionItemDto): Promise<TransactionItem> {
    this.logger.log(`Updating transaction item: ${id}`, 'UpdateTransactionItemUseCase');

    const existing = await this.transactionItemRepository.findById(id);
    if (!existing) {
      throw new Error(`Transaction item with ID "${id}" not found`);
    }

    if (payload.name && payload.name !== existing.name) {
      const duplicate = await this.transactionItemRepository.findByName(payload.name);
      if (duplicate) {
        throw new Error(`Transaction item with name "${payload.name}" already exists`);
      }
    }

    const updated = new TransactionItem(
      existing.id,
      payload.name ?? existing.name,
      payload.description ?? existing.description,
      new Date(),
    );

    return this.transactionItemRepository.update(updated);
  }
}
