import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionItemsModule } from './modules/transaction-items/transaction-items.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { TransactionEntity } from './infrastructure/persistence/postgresql/transaction.entity';
import { TransactionItemEntity } from './infrastructure/persistence/postgresql/transaction-item.entity';
import { CategoryEntity } from './infrastructure/persistence/postgresql/category.entity';
import { AccountEntity } from './infrastructure/persistence/postgresql/account.entity';
import { UserEntity } from './infrastructure/persistence/postgresql/user.entity';
import { RefreshTokenEntity } from './infrastructure/persistence/postgresql/refresh-token.entity';
import { CreateCategoryTable1704153600000 } from './database/migrations/1704153600000-CreateCategoryTable';
import { CreateAccountTable1704153600001 } from './database/migrations/1704153600001-CreateAccountTable';
import { CreateTransactionItemTable1704153600002 } from './database/migrations/1704153600002-CreateTransactionItemTable';
import { CreateTransactionTable1704153600003 } from './database/migrations/1704153600003-CreateTransactionTable';
import { SeedDefaultCategories1704153600004 } from './database/migrations/1704153600004-SeedDefaultCategories';
import { AddTransactionDefaultPartition1704153600005 } from './database/migrations/1704153600005-AddTransactionDefaultPartition';
import { CreateUserTable1704153600006 } from './database/migrations/1704153600006-CreateUserTable';
import { CreateRefreshTokenTable1704153600007 } from './database/migrations/1704153600007-CreateRefreshTokenTable';
import { AddRoleToUsers1704153600008 } from './database/migrations/1704153600008-AddRoleToUsers';
import { SeedAdminUser1704153600009 } from './database/migrations/1704153600009-SeedAdminUser';
import { DatabaseService } from './database/database.service';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

const usePostgres = process.env.DB_MODE === 'postgres';

@Module({
  imports: [
    ...(usePostgres
      ? [
          TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_DATABASE || 'js_mygoals_be',
            entities: [
              TransactionEntity,
              TransactionItemEntity,
              CategoryEntity,
              AccountEntity,
              UserEntity,
              RefreshTokenEntity,
            ],
            migrations: [
              CreateCategoryTable1704153600000,
              CreateAccountTable1704153600001,
              CreateTransactionItemTable1704153600002,
              CreateTransactionTable1704153600003,
              SeedDefaultCategories1704153600004,
              AddTransactionDefaultPartition1704153600005,
              CreateUserTable1704153600006,
              CreateRefreshTokenTable1704153600007,
              AddRoleToUsers1704153600008,
              SeedAdminUser1704153600009,
            ],
            migrationsRun: false,
            synchronize: false,
          }),
        ]
      : []),
    DatabaseModule,
    AuthModule,
    TransactionsModule,
    TransactionItemsModule,
    CategoriesModule,
    AccountsModule,
  ],
  providers: [
    DatabaseService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private databaseService: DatabaseService) {}

  async onModuleInit() {
    if (process.env.DB_MODE === 'postgres') {
      await this.databaseService.runMigrations();
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
