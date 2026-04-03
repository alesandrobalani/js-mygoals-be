import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { CreateTransactionUseCase } from '../../use-cases/transaction/create-transaction.usecase';
import { GetTransactionsUseCase } from '../../use-cases/transaction/get-transactions.usecase';
import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';

@Module({
  controllers: [TransactionsController],
  providers: [
    InMemoryTransactionRepository,
    {
      provide: 'TransactionRepository',
      useExisting: InMemoryTransactionRepository,
    },
    CreateTransactionUseCase,
    GetTransactionsUseCase,
  ],
})
export class TransactionsModule {}
