import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { CreateAccountUseCase } from '../../use-cases/account/create-account.usecase';
import { GetAccountsUseCase } from '../../use-cases/account/get-accounts.usecase';
import { UpdateAccountUseCase } from '../../use-cases/account/update-account.usecase';
import { DeleteAccountUseCase } from '../../use-cases/account/delete-account.usecase';
import { InMemoryAccountRepository } from '../../infrastructure/persistence/in-memory/account.repository';
import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';

@Module({
  controllers: [AccountsController],
  providers: [
    InMemoryAccountRepository,
    InMemoryTransactionRepository,
    {
      provide: 'AccountRepository',
      useExisting: InMemoryAccountRepository,
    },
    {
      provide: 'TransactionRepository',
      useExisting: InMemoryTransactionRepository,
    },
    CreateAccountUseCase,
    GetAccountsUseCase,
    UpdateAccountUseCase,
    DeleteAccountUseCase,
  ],
})
export class TestAccountsModule {}
