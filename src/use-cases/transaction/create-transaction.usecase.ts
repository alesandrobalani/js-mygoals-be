import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionRepository } from '../../domain/repositories/transaction.repository';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { AccountRepository } from '../../domain/repositories/account.repository';
import { TransactionItemRepository } from '../../domain/repositories/transaction-item.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateTransactionUseCase {
  private readonly logger = new Logger(CreateTransactionUseCase.name);

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

  async execute(payload: CreateTransactionDto): Promise<Transaction> {
    this.logger.log(`Creating transaction: ${payload.description} - ${payload.amount} ${payload.type}`, 'CreateTransactionUseCase');

    // Find the category
    const category = await this.categoryRepository.findById(payload.categoryId);
    if (!category) {
      throw new NotFoundException(`Category with ID "${payload.categoryId}" not found`);
    }

    const account = await this.accountRepository.findById(payload.accountId);
    if (!account) {
      throw new NotFoundException(`Account with ID "${payload.accountId}" not found`);
    }

    const transactionItem = await this.transactionItemRepository.findById(payload.transactionItemId);
    if (!transactionItem) {
      throw new NotFoundException(`Transaction item with ID "${payload.transactionItemId}" not found`);
    }

    const transaction = new Transaction(
        randomUUID(),
        payload.description,
        payload.amount,
        payload.type,
        category,
        transactionItem,
        payload.transactionDate,
        account,
        new Date(),
        payload.dueDate !== undefined ? payload.dueDate : payload.transactionDate,
        payload.settled
    );

    try {
      const result = await this.transactionRepository.create(transaction);
      this.logger.log(`Transaction created successfully with ID: ${result.id}`, 'CreateTransactionUseCase');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to create transaction: ${errorMessage}`, errorStack, 'CreateTransactionUseCase');
      throw error;
    }
  }
}
