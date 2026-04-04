import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { CreateTransactionUseCase } from '../../use-cases/transaction/create-transaction.usecase';
import { GetTransactionsUseCase } from '../../use-cases/transaction/get-transactions.usecase';
import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';
import { InMemoryTransactionItemRepository } from '../../infrastructure/persistence/in-memory/transaction-item.repository';
import { InMemoryCategoryRepository } from '../../infrastructure/persistence/in-memory/category.repository';
import { InMemoryAccountRepository } from '../../infrastructure/persistence/in-memory/account.repository';
import { AccountsController } from '../accounts/accounts.controller';
import { CreateAccountUseCase } from '../../use-cases/account/create-account.usecase';
import { GetAccountsUseCase } from '../../use-cases/account/get-accounts.usecase';
import { UpdateAccountUseCase } from '../../use-cases/account/update-account.usecase';
import { DeleteAccountUseCase } from '../../use-cases/account/delete-account.usecase';

@Module({
  controllers: [TransactionsController, AccountsController],
  providers: [
    InMemoryTransactionRepository,
    InMemoryTransactionItemRepository,
    InMemoryCategoryRepository,
    InMemoryAccountRepository,
    {
      provide: 'TransactionRepository',
      useExisting: InMemoryTransactionRepository,
    },
    {
      provide: 'TransactionItemRepository',
      useExisting: InMemoryTransactionItemRepository,
    },
    {
      provide: 'CategoryRepository',
      useExisting: InMemoryCategoryRepository,
    },
    {
      provide: 'AccountRepository',
      useExisting: InMemoryAccountRepository,
    },
    CreateTransactionUseCase,
    GetTransactionsUseCase,
    CreateAccountUseCase,
    GetAccountsUseCase,
    UpdateAccountUseCase,
    DeleteAccountUseCase,
  ],
})
export class TestTransactionsModule {}