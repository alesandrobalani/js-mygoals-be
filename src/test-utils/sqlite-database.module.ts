import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AccountEntity } from '../infrastructure/persistence/postgresql/account.entity';
import { CategoryEntity } from '../infrastructure/persistence/postgresql/category.entity';
import { RefreshTokenEntity } from '../infrastructure/persistence/postgresql/refresh-token.entity';
import { TransactionItemEntity } from '../infrastructure/persistence/postgresql/transaction-item.entity';
import { TransactionEntity } from '../infrastructure/persistence/postgresql/transaction.entity';
import { UserEntity } from '../infrastructure/persistence/postgresql/user.entity';
import { FileImportEntity } from '../infrastructure/persistence/postgresql/file-import.entity';
import { ImportedTransactionEntity } from '../infrastructure/persistence/postgresql/imported-transaction.entity';
import { PostgreSQLAccountRepository } from '../infrastructure/persistence/postgresql/account.repository';
import { PostgreSQLCategoryRepository } from '../infrastructure/persistence/postgresql/category.repository';
import { PostgreSQLRefreshTokenRepository } from '../infrastructure/persistence/postgresql/refresh-token.repository';
import { PostgreSQLTransactionItemRepository } from '../infrastructure/persistence/postgresql/transaction-item.repository';
import { PostgreSQLTransactionRepository } from '../infrastructure/persistence/postgresql/transaction.repository';
import { PostgreSQLUserRepository } from '../infrastructure/persistence/postgresql/user.repository';
import { PostgreSQLFileImportRepository } from '../infrastructure/persistence/postgresql/file-import.repository';
import { PostgreSQLImportedTransactionRepository } from '../infrastructure/persistence/postgresql/imported-transaction.repository';

const ALL_ENTITIES = [
  AccountEntity,
  CategoryEntity,
  RefreshTokenEntity,
  TransactionItemEntity,
  TransactionEntity,
  UserEntity,
  FileImportEntity,
  ImportedTransactionEntity,
];

function patchSqliteDriverForTimestamp(dataSource: DataSource): void {
  const driver = (dataSource as any).driver;
  driver.supportedDataTypes.push('timestamp');
  const origNormalizeType = driver.normalizeType.bind(driver);
  driver.normalizeType = (col: any) =>
    col.type === 'timestamp' ? 'datetime' : origNormalizeType(col);
  const origHydrate = driver.prepareHydratedValue.bind(driver);
  driver.prepareHydratedValue = (value: any, col: any) =>
    col.type === 'timestamp' ? origHydrate(value, { ...col, type: 'datetime' }) : origHydrate(value, col);
  const origPersist = driver.preparePersistentValue.bind(driver);
  driver.preparePersistentValue = (value: any, col: any) =>
    col.type === 'timestamp' ? origPersist(value, { ...col, type: 'datetime' }) : origPersist(value, col);
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'better-sqlite3' as const,
        database: ':memory:',
        entities: ALL_ENTITIES,
        synchronize: true,
        logging: false,
      }),
      dataSourceFactory: async (options) => {
        const dataSource = new DataSource(options!);
        patchSqliteDriverForTimestamp(dataSource);
        return dataSource.initialize();
      },
    }),
    TypeOrmModule.forFeature(ALL_ENTITIES),
  ],
  providers: [
    PostgreSQLAccountRepository,
    { provide: 'AccountRepository', useExisting: PostgreSQLAccountRepository },
    PostgreSQLCategoryRepository,
    { provide: 'CategoryRepository', useExisting: PostgreSQLCategoryRepository },
    PostgreSQLRefreshTokenRepository,
    { provide: 'RefreshTokenRepository', useExisting: PostgreSQLRefreshTokenRepository },
    PostgreSQLTransactionItemRepository,
    { provide: 'TransactionItemRepository', useExisting: PostgreSQLTransactionItemRepository },
    PostgreSQLTransactionRepository,
    { provide: 'TransactionRepository', useExisting: PostgreSQLTransactionRepository },
    PostgreSQLUserRepository,
    { provide: 'UserRepository', useExisting: PostgreSQLUserRepository },
    PostgreSQLFileImportRepository,
    { provide: 'FileImportRepository', useExisting: PostgreSQLFileImportRepository },
    PostgreSQLImportedTransactionRepository,
    { provide: 'ImportedTransactionRepository', useExisting: PostgreSQLImportedTransactionRepository },
  ],
  exports: [
    'AccountRepository',
    'CategoryRepository',
    'RefreshTokenRepository',
    'TransactionItemRepository',
    'TransactionRepository',
    'UserRepository',
    'FileImportRepository',
    'ImportedTransactionRepository',
  ],
})
export class SqliteDatabaseModule {}
