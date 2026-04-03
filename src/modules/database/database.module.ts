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

const usePostgres = process.env.DB_MODE === 'postgres';

@Module({
  imports: [
    ...(usePostgres ? [
      TypeOrmModule.forFeature([AccountEntity, TransactionEntity, CategoryEntity])
    ] : []),
  ],
  providers: [
    // Account repositories
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

    // Transaction repositories
    InMemoryTransactionRepository,
    ...(usePostgres ? [PostgreSQLTransactionRepository] : []),
    {
      provide: 'TransactionRepository',
      useFactory: (
        inMemoryRepo: InMemoryTransactionRepository,
        pgRepo?: PostgreSQLTransactionRepository,
      ) => {
        const dbMode = process.env.DB_MODE || 'memory';
        return dbMode === 'postgres' ? pgRepo : inMemoryRepo;
      },
      inject: [
        InMemoryTransactionRepository,
        ...(usePostgres ? [PostgreSQLTransactionRepository] : []),
      ],
    },

    // Category repositories
    InMemoryCategoryRepository,
    ...(usePostgres ? [PostgreSQLCategoryRepository] : []),
    {
      provide: 'CategoryRepository',
      useFactory: (
        inMemoryRepo: InMemoryCategoryRepository,
        pgRepo?: PostgreSQLCategoryRepository,
      ) => {
        const dbMode = process.env.DB_MODE || 'memory';
        return dbMode === 'postgres' ? pgRepo : inMemoryRepo;
      },
      inject: [
        InMemoryCategoryRepository,
        ...(usePostgres ? [PostgreSQLCategoryRepository] : []),
      ],
    },
  ],
  exports: [
    'AccountRepository',
    'TransactionRepository',
    'CategoryRepository',
  ],
})
export class DatabaseModule {}