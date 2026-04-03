import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { DatabaseModule } from './modules/database/database.module';
import { TransactionEntity } from './infrastructure/persistence/postgresql/transaction.entity';
import { CategoryEntity } from './infrastructure/persistence/postgresql/category.entity';
import { AccountEntity } from './infrastructure/persistence/postgresql/account.entity';
import { CreateCategoryTable1704153600000 } from './database/migrations/1704153600000-CreateCategoryTable';
import { CreateAccountTable1704153600001 } from './database/migrations/1704153600001-CreateAccountTable';
import { CreateTransactionTable1704153600002 } from './database/migrations/1704153600002-CreateTransactionTable';
import { SeedDefaultCategories1704153600003 } from './database/migrations/1704153600003-SeedDefaultCategories';
import { DatabaseService } from './database/database.service';
import { LoggingMiddleware } from './middleware/logging.middleware';

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
            entities: [TransactionEntity, CategoryEntity, AccountEntity],
            migrations: [
              CreateCategoryTable1704153600000,
              CreateAccountTable1704153600001,
              CreateTransactionTable1704153600002,
              SeedDefaultCategories1704153600003,
            ],
            migrationsRun: false, // Executar manualmente via DatabaseService
            synchronize: false,
          }),
        ]
      : []),
    DatabaseModule,
    TransactionsModule,
    CategoriesModule,
    AccountsModule,
  ],
  providers: [DatabaseService],
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
