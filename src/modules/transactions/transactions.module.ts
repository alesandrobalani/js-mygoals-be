import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { CreateTransactionUseCase } from '../../use-cases/transaction/create-transaction.usecase';
import { GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase } from '../../use-cases/transaction/get-transactions-summary-by-period.usecase';
import { FindTransactionsByPeriodUseCase } from '../../use-cases/transaction/find-transactions-by-period.usecase';
import { TransactionEntity } from '../../infrastructure/persistence/postgresql/transaction.entity';
import { CategoriesModule } from '../categories/categories.module';
import { DatabaseModule } from '../database/database.module';

const usePostgres = process.env.DB_MODE === 'postgres';

@Module({
  imports: [
    ...(usePostgres ? [TypeOrmModule.forFeature([TransactionEntity])] : []),
    CategoriesModule,
    DatabaseModule,
  ],
  controllers: [TransactionsController],
  providers: [
    CreateTransactionUseCase,
    GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase,
    FindTransactionsByPeriodUseCase,
  ],
})
export class TransactionsModule {}
