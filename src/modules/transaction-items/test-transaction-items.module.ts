import { Module } from '@nestjs/common';
import { TransactionItemsController } from './transaction-items.controller';
import { InMemoryTransactionItemRepository } from '../../infrastructure/persistence/in-memory/transaction-item.repository';
import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';
import { CreateTransactionItemUseCase } from '../../use-cases/transaction-item/create-transaction-item.usecase';
import { GetTransactionItemsUseCase } from '../../use-cases/transaction-item/get-transaction-items.usecase';
import { GetTransactionItemUseCase } from '../../use-cases/transaction-item/get-transaction-item.usecase';
import { UpdateTransactionItemUseCase } from '../../use-cases/transaction-item/update-transaction-item.usecase';
import { DeleteTransactionItemUseCase } from '../../use-cases/transaction-item/delete-transaction-item.usecase';

@Module({
  controllers: [TransactionItemsController],
  providers: [
    InMemoryTransactionItemRepository,
    InMemoryTransactionRepository,
    {
      provide: 'TransactionItemRepository',
      useExisting: InMemoryTransactionItemRepository,
    },
    {
      provide: 'TransactionRepository',
      useExisting: InMemoryTransactionRepository,
    },
    CreateTransactionItemUseCase,
    GetTransactionItemsUseCase,
    GetTransactionItemUseCase,
    UpdateTransactionItemUseCase,
    DeleteTransactionItemUseCase,
  ],
})
export class TestTransactionItemsModule {}
