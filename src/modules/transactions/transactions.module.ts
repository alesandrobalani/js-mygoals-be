import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { CreateTransactionUseCase } from '../../use-cases/transaction/create-transaction.usecase';
import { GetTransactionsUseCase } from '../../use-cases/transaction/get-transactions.usecase';
import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';
import { PostgreSQLTransactionRepository } from '../../infrastructure/persistence/postgresql/transaction.repository';
import { TransactionEntity } from '../../infrastructure/persistence/postgresql/transaction.entity';
import { CategoriesModule } from '../categories/categories.module';
import { AccountsModule } from '../accounts/accounts.module';

const usePostgres = process.env.DB_MODE === 'postgres';

@Module({
  imports: [
    ...(usePostgres ? [TypeOrmModule.forFeature([TransactionEntity])] : []),
    CategoriesModule,
    AccountsModule,
  ],
  controllers: [TransactionsController],
  providers: [
    InMemoryTransactionRepository,
    ...(usePostgres ? [PostgreSQLTransactionRepository] : []),
    {
      provide: 'TransactionRepository',
      useFactory: (
        inMemoryRepo: InMemoryTransactionRepository, 
        pgRepo?: PostgreSQLTransactionRepository
      ) => {
        const dbMode = process.env.DB_MODE || 'memory';
        return dbMode === 'postgres' ? pgRepo : inMemoryRepo;
      },
      inject: [
        InMemoryTransactionRepository, 
        ...(usePostgres ? [PostgreSQLTransactionRepository] : [])
      ],
    },
    CreateTransactionUseCase,
    GetTransactionsUseCase,
  ],
})
export class TransactionsModule {}
