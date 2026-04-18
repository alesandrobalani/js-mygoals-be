import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsController } from './accounts.controller';
import { CreateAccountUseCase } from '../../use-cases/account/create-account.usecase';
import { GetAccountsUseCase } from '../../use-cases/account/get-accounts.usecase';
import { UpdateAccountUseCase } from '../../use-cases/account/update-account.usecase';
import { DeleteAccountUseCase } from '../../use-cases/account/delete-account.usecase';
import { AccountEntity } from '../../infrastructure/persistence/postgresql/account.entity';
import { DatabaseModule } from '../database/database.module';

const usePostgres = process.env.DB_MODE === 'postgres';

@Module({
  imports: [
    ...(usePostgres ? [TypeOrmModule.forFeature([AccountEntity])] : []),
    DatabaseModule,
  ],
  controllers: [AccountsController],
  providers: [
    CreateAccountUseCase,
    GetAccountsUseCase,
    UpdateAccountUseCase,
    DeleteAccountUseCase,
  ],
  exports: [
    CreateAccountUseCase,
    GetAccountsUseCase,
    UpdateAccountUseCase,
    DeleteAccountUseCase,
  ],
})
export class AccountsModule {}
