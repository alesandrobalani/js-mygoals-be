import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionRepository } from '../../domain/repositories/transaction.repository';
import { CategoryRepository } from '../../domain/repositories/category.repository';

@Injectable()
export class CreateTransactionUseCase {
  private readonly logger = new Logger(CreateTransactionUseCase.name);

  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(payload: CreateTransactionDto): Promise<Transaction> {
    this.logger.log(`Creating transaction: ${payload.description} - ${payload.amount} ${payload.type}`, 'CreateTransactionUseCase');

    // Find the category
    const category = await this.categoryRepository.findById(payload.categoryId);
    if (!category) {
      throw new Error(`Category with ID "${payload.categoryId}" not found`);
    }

    const transaction = new Transaction(
        uuidv4(),
        payload.description,
        payload.amount,
        payload.type,
        category,
        payload.transactionDate,
        payload.account,
        new Date(),
        payload.dueDate !== undefined ? payload.dueDate : payload.transactionDate,
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
