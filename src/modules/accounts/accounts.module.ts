import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsController } from './accounts.controller';
import { CreateAccountUseCase } from '../../use-cases/account/create-account.usecase';
import { GetAccountsUseCase } from '../../use-cases/account/get-accounts.usecase';
import { UpdateAccountUseCase } from '../../use-cases/account/update-account.usecase';
import { DeleteAccountUseCase } from '../../use-cases/account/delete-account.usecase';
import { InMemoryAccountRepository } from '../../infrastructure/persistence/in-memory/account.repository';
import { PostgreSQLAccountRepository } from '../../infrastructure/persistence/postgresql/account.repository';
import { AccountEntity } from '../../infrastructure/persistence/postgresql/account.entity';
import { TransactionsModule } from '../transactions/transactions.module';

const usePostgres = process.env.DB_MODE === 'postgres';

@Module({
  imports: [
    ...(usePostgres ? [TypeOrmModule.forFeature([AccountEntity])] : []),
    TransactionsModule,
  ],
  controllers: [AccountsController],
  providers: [
    InMemoryAccountRepository,
    ...(usePostgres ? [PostgreSQLAccountRepository] : []),
    {
      provide: 'AccountRepository',
      useFactory: (
        inMemoryRepo: InMemoryAccountRepository,
        pgRepo?: PostgreSQLAccountRepository,
      ) => {
        const dbMode = process.env.DB_MODE || 'memory';
        return dbMode === 'postgres' ? pgRepo : inMemoryRepo;
      },
      inject: [
        InMemoryAccountRepository,
        ...(usePostgres ? [PostgreSQLAccountRepository] : []),
      ],
    },
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
