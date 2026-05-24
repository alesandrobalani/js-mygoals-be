import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateTransactionDto } from '../../dto/update-transaction.dto';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionRepository } from '../../domain/repositories/transaction.repository';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { AccountRepository } from '../../domain/repositories/account.repository';
import { TransactionItemRepository } from '../../domain/repositories/transaction-item.repository';

export interface UpdateTransactionInput extends UpdateTransactionDto {
  id: string;
}

@Injectable()
export class UpdateTransactionUseCase {
  private readonly logger = new Logger(UpdateTransactionUseCase.name);

  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository,
    @Inject('TransactionItemRepository')
    private readonly transactionItemRepository: TransactionItemRepository,
  ) {}

  async execute(input: UpdateTransactionInput): Promise<Transaction> {
    this.logger.log(`Updating transaction: ${input.id}`, 'UpdateTransactionUseCase');

    const existing = await this.transactionRepository.findById(input.id);
    if (!existing) {
      throw new NotFoundException(`Transaction with ID "${input.id}" not found`);
    }

    const category = await this.categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new NotFoundException(`Category with ID "${input.categoryId}" not found`);
    }

    const account = await this.accountRepository.findById(input.accountId);
    if (!account) {
      throw new NotFoundException(`Account with ID "${input.accountId}" not found`);
    }

    const transactionItem = await this.transactionItemRepository.findById(input.transactionItemId);
    if (!transactionItem) {
      throw new NotFoundException(`Transaction item with ID "${input.transactionItemId}" not found`);
    }

    const updated = new Transaction(
      existing.id,
      input.description,
      input.amount,
      input.type,
      category,
      transactionItem,
      input.transactionDate,
      account,
      new Date(),
      input.dueDate !== undefined ? input.dueDate : input.transactionDate,
      input.settled,
    );

    try {
      const result = await this.transactionRepository.update(updated);
      this.logger.log(`Transaction updated successfully: ${result.id}`, 'UpdateTransactionUseCase');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to update transaction: ${errorMessage}`, errorStack, 'UpdateTransactionUseCase');
      throw error;
    }
  }
}
