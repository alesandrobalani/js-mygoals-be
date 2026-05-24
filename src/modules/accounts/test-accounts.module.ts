import { Module } from '@nestjs/common';
import { SqliteDatabaseModule } from '../../test-utils/sqlite-database.module';
import { AccountsController } from './accounts.controller';
import { CreateAccountUseCase } from '../../use-cases/account/create-account.usecase';
import { GetAccountsUseCase } from '../../use-cases/account/get-accounts.usecase';
import { UpdateAccountUseCase } from '../../use-cases/account/update-account.usecase';
import { DeleteAccountUseCase } from '../../use-cases/account/delete-account.usecase';

@Module({
  imports: [SqliteDatabaseModule],
  controllers: [AccountsController],
  providers: [CreateAccountUseCase, GetAccountsUseCase, UpdateAccountUseCase, DeleteAccountUseCase],
})
export class TestAccountsModule {}
