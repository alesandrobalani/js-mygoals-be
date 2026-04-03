import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { CreateTransactionUseCase } from '../../use-cases/transaction/create-transaction.usecase';
import { GetTransactionsUseCase } from '../../use-cases/transaction/get-transactions.usecase';
import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';
import { InMemoryCategoryRepository } from '../../infrastructure/persistence/in-memory/category.repository';

@Module({
  controllers: [TransactionsController],
  providers: [
    InMemoryTransactionRepository,
    InMemoryCategoryRepository,
    {
      provide: 'TransactionRepository',
      useExisting: InMemoryTransactionRepository,
    },
    {
      provide: 'CategoryRepository',
      useExisting: InMemoryCategoryRepository,
    },
    CreateTransactionUseCase,
    GetTransactionsUseCase,
  ],
})
export class TestTransactionsModule {}