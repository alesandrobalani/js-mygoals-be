import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '../../infrastructure/persistence/postgresql/account.entity';
import { CategoryEntity } from '../../infrastructure/persistence/postgresql/category.entity';
import { RefreshTokenEntity } from '../../infrastructure/persistence/postgresql/refresh-token.entity';
import { TransactionItemEntity } from '../../infrastructure/persistence/postgresql/transaction-item.entity';
import { TransactionEntity } from '../../infrastructure/persistence/postgresql/transaction.entity';
import { UserEntity } from '../../infrastructure/persistence/postgresql/user.entity';
import { PostgreSQLAccountRepository } from '../../infrastructure/persistence/postgresql/account.repository';
import { PostgreSQLCategoryRepository } from '../../infrastructure/persistence/postgresql/category.repository';
import { PostgreSQLRefreshTokenRepository } from '../../infrastructure/persistence/postgresql/refresh-token.repository';
import { PostgreSQLTransactionItemRepository } from '../../infrastructure/persistence/postgresql/transaction-item.repository';
import { PostgreSQLTransactionRepository } from '../../infrastructure/persistence/postgresql/transaction.repository';
import { PostgreSQLUserRepository } from '../../infrastructure/persistence/postgresql/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountEntity,
      CategoryEntity,
      RefreshTokenEntity,
      TransactionItemEntity,
      TransactionEntity,
      UserEntity,
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
  ],
  exports: [
    'AccountRepository',
    'CategoryRepository',
    'RefreshTokenRepository',
    'TransactionItemRepository',
    'TransactionRepository',
    'UserRepository',
  ],
})
export class DatabaseModule {}
