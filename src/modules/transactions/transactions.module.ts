import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { CreateTransactionUseCase } from '../../use-cases/transaction/create-transaction.usecase';
import { GetTransactionsUseCase } from '../../use-cases/transaction/get-transactions.usecase';
import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';
import { PostgreSQLTransactionRepository } from '../../infrastructure/persistence/postgresql/transaction.repository';
import { TransactionEntity } from '../../infrastructure/persistence/postgresql/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity])],
  controllers: [TransactionsController],
  providers: [
    InMemoryTransactionRepository,
    PostgreSQLTransactionRepository,
    {
      provide: 'TransactionRepository',
      useFactory: (inMemoryRepo: InMemoryTransactionRepository, pgRepo: PostgreSQLTransactionRepository) => {
        const dbMode = process.env.DB_MODE || 'memory';
        return dbMode === 'postgres' ? pgRepo : inMemoryRepo;
      },
      inject: [InMemoryTransactionRepository, PostgreSQLTransactionRepository],
    },
    CreateTransactionUseCase,
    GetTransactionsUseCase,
  ],
})
export class TransactionsModule {}
