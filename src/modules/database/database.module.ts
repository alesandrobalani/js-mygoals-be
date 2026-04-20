import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InMemoryAccountRepository } from '../../infrastructure/persistence/in-memory/account.repository';
import { PostgreSQLAccountRepository } from '../../infrastructure/persistence/postgresql/account.repository';
import { AccountEntity } from '../../infrastructure/persistence/postgresql/account.entity';
import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';
import { PostgreSQLTransactionRepository } from '../../infrastructure/persistence/postgresql/transaction.repository';
import { TransactionEntity } from '../../infrastructure/persistence/postgresql/transaction.entity';
import { InMemoryCategoryRepository } from '../../infrastructure/persistence/in-memory/category.repository';
import { PostgreSQLCategoryRepository } from '../../infrastructure/persistence/postgresql/category.repository';
import { CategoryEntity } from '../../infrastructure/persistence/postgresql/category.entity';
import { InMemoryTransactionItemRepository } from '../../infrastructure/persistence/in-memory/transaction-item.repository';
import { PostgreSQLTransactionItemRepository } from '../../infrastructure/persistence/postgresql/transaction-item.repository';
import { TransactionItemEntity } from '../../infrastructure/persistence/postgresql/transaction-item.entity';
import { InMemoryUserRepository } from '../../infrastructure/persistence/in-memory/user.repository';
import { PostgreSQLUserRepository } from '../../infrastructure/persistence/postgresql/user.repository';
import { UserEntity } from '../../infrastructure/persistence/postgresql/user.entity';
import { InMemoryRefreshTokenRepository } from '../../infrastructure/persistence/in-memory/refresh-token.repository';
import { PostgreSQLRefreshTokenRepository } from '../../infrastructure/persistence/postgresql/refresh-token.repository';
import { RefreshTokenEntity } from '../../infrastructure/persistence/postgresql/refresh-token.entity';

const usePostgres = process.env.DB_MODE === 'postgres';

@Module({
  imports: [
    ...(usePostgres ? [
      TypeOrmModule.forFeature([
        AccountEntity,
        TransactionEntity,
        CategoryEntity,
        TransactionItemEntity,
        UserEntity,
        RefreshTokenEntity,
      ])
    ] : []),
  ],
  providers: [
    // Account repositories
    InMemoryAccountRepository,
    ...(usePostgres ? [PostgreSQLAccountRepository] : []),
    {
      provide: 'AccountRepository',
      useFactory: (inMemoryRepo: InMemoryAccountRepository, pgRepo?: PostgreSQLAccountRepository) =>
        process.env.DB_MODE === 'postgres' ? pgRepo : inMemoryRepo,
      inject: [InMemoryAccountRepository, ...(usePostgres ? [PostgreSQLAccountRepository] : [])],
    },

    // Transaction repositories
    InMemoryTransactionRepository,
    ...(usePostgres ? [PostgreSQLTransactionRepository] : []),
    {
      provide: 'TransactionRepository',
      useFactory: (inMemoryRepo: InMemoryTransactionRepository, pgRepo?: PostgreSQLTransactionRepository) =>
        process.env.DB_MODE === 'postgres' ? pgRepo : inMemoryRepo,
      inject: [InMemoryTransactionRepository, ...(usePostgres ? [PostgreSQLTransactionRepository] : [])],
    },

    // Transaction item repositories
    InMemoryTransactionItemRepository,
    ...(usePostgres ? [PostgreSQLTransactionItemRepository] : []),
    {
      provide: 'TransactionItemRepository',
      useFactory: (inMemoryRepo: InMemoryTransactionItemRepository, pgRepo?: PostgreSQLTransactionItemRepository) =>
        process.env.DB_MODE === 'postgres' ? pgRepo : inMemoryRepo,
      inject: [InMemoryTransactionItemRepository, ...(usePostgres ? [PostgreSQLTransactionItemRepository] : [])],
    },

    // Category repositories
    InMemoryCategoryRepository,
    ...(usePostgres ? [PostgreSQLCategoryRepository] : []),
    {
      provide: 'CategoryRepository',
      useFactory: (inMemoryRepo: InMemoryCategoryRepository, pgRepo?: PostgreSQLCategoryRepository) =>
        process.env.DB_MODE === 'postgres' ? pgRepo : inMemoryRepo,
      inject: [InMemoryCategoryRepository, ...(usePostgres ? [PostgreSQLCategoryRepository] : [])],
    },

    // User repositories
    InMemoryUserRepository,
    ...(usePostgres ? [PostgreSQLUserRepository] : []),
    {
      provide: 'UserRepository',
      useFactory: (inMemoryRepo: InMemoryUserRepository, pgRepo?: PostgreSQLUserRepository) =>
        process.env.DB_MODE === 'postgres' ? pgRepo : inMemoryRepo,
      inject: [InMemoryUserRepository, ...(usePostgres ? [PostgreSQLUserRepository] : [])],
    },

    // Refresh token repositories
    InMemoryRefreshTokenRepository,
    ...(usePostgres ? [PostgreSQLRefreshTokenRepository] : []),
    {
      provide: 'RefreshTokenRepository',
      useFactory: (inMemoryRepo: InMemoryRefreshTokenRepository, pgRepo?: PostgreSQLRefreshTokenRepository) =>
        process.env.DB_MODE === 'postgres' ? pgRepo : inMemoryRepo,
      inject: [InMemoryRefreshTokenRepository, ...(usePostgres ? [PostgreSQLRefreshTokenRepository] : [])],
    },
  ],
  exports: [
    'AccountRepository',
    'TransactionRepository',
    'TransactionItemRepository',
    'CategoryRepository',
    'UserRepository',
    'RefreshTokenRepository',
  ],
})
export class DatabaseModule {}
