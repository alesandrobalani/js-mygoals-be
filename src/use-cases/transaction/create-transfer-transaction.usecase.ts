import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateTransferTransactionDto } from '../../dto/create-transfer-transaction.dto';
import { TransactionRepository, TransferResult } from '../../domain/repositories/transaction.repository';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { AccountRepository } from '../../domain/repositories/account.repository';
import { TransactionItemRepository } from '../../domain/repositories/transaction-item.repository';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionType } from '../../dto/create-transaction.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateTransferTransactionUseCase {
  private readonly logger = new Logger(CreateTransferTransactionUseCase.name);

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

  async execute(payload: CreateTransferTransactionDto): Promise<TransferResult> {
    this.logger.log(`Creating transfer of ${payload.amount} from account ${payload.debitAccountId} to ${payload.creditAccountId}`, 'CreateTransferTransactionUseCase');

    const category = await this.categoryRepository.findById(payload.categoryId);
    if (!category) {
      throw new BadRequestException(`Category with ID "${payload.categoryId}" not found`);
    }
    if (!category.isTransfer) {
      throw new BadRequestException(`Category "${category.name}" is not a transfer category`);
    }

    const debitAccount = await this.accountRepository.findById(payload.debitAccountId);
    if (!debitAccount) {
      throw new BadRequestException(`Debit account with ID "${payload.debitAccountId}" not found`);
    }

    const creditAccount = await this.accountRepository.findById(payload.creditAccountId);
    if (!creditAccount) {
      throw new BadRequestException(`Credit account with ID "${payload.creditAccountId}" not found`);
    }

    const transactionItem = await this.transactionItemRepository.findById(payload.transactionItemId);
    if (!transactionItem) {
      throw new BadRequestException(`Transaction item with ID "${payload.transactionItemId}" not found`);
    }

    const now = new Date();

    const debitTransaction = new Transaction(
      randomUUID(),
      undefined,
      payload.amount,
      TransactionType.EXPENSE,
      category,
      transactionItem,
      payload.transactionDate,
      debitAccount,
      now,
      payload.dueDate,
      payload.settled,
    );

    const creditTransaction = new Transaction(
      randomUUID(),
      undefined,
      payload.amount,
      TransactionType.INCOME,
      category,
      transactionItem,
      payload.transactionDate,
      creditAccount,
      now,
      payload.dueDate,
      payload.settled,
    );

    try {
      const result = await this.transactionRepository.createPair(debitTransaction, creditTransaction);
      this.logger.log(`Transfer created: debit=${result.debit.id}, credit=${result.credit.id}`, 'CreateTransferTransactionUseCase');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to create transfer: ${errorMessage}`, errorStack, 'CreateTransferTransactionUseCase');
      throw error;
    }
  }
}
