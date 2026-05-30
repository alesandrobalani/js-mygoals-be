import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '../../infrastructure/persistence/postgresql/account.entity';
import { CategoryEntity } from '../../infrastructure/persistence/postgresql/category.entity';
import { RefreshTokenEntity } from '../../infrastructure/persistence/postgresql/refresh-token.entity';
import { TransactionItemEntity } from '../../infrastructure/persistence/postgresql/transaction-item.entity';
import { TransactionEntity } from '../../infrastructure/persistence/postgresql/transaction.entity';
import { UserEntity } from '../../infrastructure/persistence/postgresql/user.entity';
import { FileImportEntity } from '../../infrastructure/persistence/postgresql/file-import.entity';
import { ImportedTransactionEntity } from '../../infrastructure/persistence/postgresql/imported-transaction.entity';
import { PostgreSQLAccountRepository } from '../../infrastructure/persistence/postgresql/account.repository';
import { PostgreSQLCategoryRepository } from '../../infrastructure/persistence/postgresql/category.repository';
import { PostgreSQLRefreshTokenRepository } from '../../infrastructure/persistence/postgresql/refresh-token.repository';
import { PostgreSQLTransactionItemRepository } from '../../infrastructure/persistence/postgresql/transaction-item.repository';
import { PostgreSQLTransactionRepository } from '../../infrastructure/persistence/postgresql/transaction.repository';
import { PostgreSQLUserRepository } from '../../infrastructure/persistence/postgresql/user.repository';
import { PostgreSQLFileImportRepository } from '../../infrastructure/persistence/postgresql/file-import.repository';
import { PostgreSQLImportedTransactionRepository } from '../../infrastructure/persistence/postgresql/imported-transaction.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountEntity,
      CategoryEntity,
      RefreshTokenEntity,
      TransactionItemEntity,
      TransactionEntity,
      UserEntity,
      FileImportEntity,
      ImportedTransactionEntity,
    ]),
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
export class DatabaseModule {}
