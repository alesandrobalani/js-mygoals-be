import { Module } from '@nestjs/common';
import { SqliteDatabaseModule } from '../../test-utils/sqlite-database.module';
import { TransactionsController } from './transactions.controller';
import { AccountsController } from '../accounts/accounts.controller';
import { CreateTransactionUseCase } from '../../use-cases/transaction/create-transaction.usecase';
import { UpdateTransactionUseCase } from '../../use-cases/transaction/update-transaction.usecase';
import { GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase } from '../../use-cases/transaction/get-transactions-summary-by-period.usecase';
import { FindTransactionsByPeriodUseCase } from '../../use-cases/transaction/find-transactions-by-period.usecase';
import { CreateAccountUseCase } from '../../use-cases/account/create-account.usecase';
import { GetAccountsUseCase } from '../../use-cases/account/get-accounts.usecase';
import { UpdateAccountUseCase } from '../../use-cases/account/update-account.usecase';
import { DeleteAccountUseCase } from '../../use-cases/account/delete-account.usecase';
import { GetTransactionsSummaryByAccountByTransactionTypeUseCase } from '../../use-cases/transaction/get-transactions-summary-by-account.usecase';
import { DeleteTransactionUseCase } from '../../use-cases/transaction/delete-transaction.usecase';

@Module({
  imports: [SqliteDatabaseModule],
  controllers: [TransactionsController, AccountsController],
  providers: [
    CreateTransactionUseCase,
    UpdateTransactionUseCase,
    GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase,
    FindTransactionsByPeriodUseCase,
    CreateAccountUseCase,
    GetAccountsUseCase,
    UpdateAccountUseCase,
    DeleteAccountUseCase,
    GetTransactionsSummaryByAccountByTransactionTypeUseCase,
    DeleteTransactionUseCase,
  ],
})
export class TestTransactionsModule {}
