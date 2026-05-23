import { Module } from '@nestjs/common';
import { SqliteDatabaseModule } from '../../test-utils/sqlite-database.module';
import { TransactionItemsController } from './transaction-items.controller';
import { CreateTransactionItemUseCase } from '../../use-cases/transaction-item/create-transaction-item.usecase';
import { GetTransactionItemsUseCase } from '../../use-cases/transaction-item/get-transaction-items.usecase';
import { GetTransactionItemUseCase } from '../../use-cases/transaction-item/get-transaction-item.usecase';
import { UpdateTransactionItemUseCase } from '../../use-cases/transaction-item/update-transaction-item.usecase';
import { DeleteTransactionItemUseCase } from '../../use-cases/transaction-item/delete-transaction-item.usecase';

@Module({
  imports: [SqliteDatabaseModule],
  controllers: [TransactionItemsController],
  providers: [
    CreateTransactionItemUseCase,
    GetTransactionItemsUseCase,
    GetTransactionItemUseCase,
    UpdateTransactionItemUseCase,
    DeleteTransactionItemUseCase,
  ],
})
export class TestTransactionItemsModule {}
