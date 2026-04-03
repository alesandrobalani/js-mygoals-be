import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { TransactionEntity } from './infrastructure/persistence/postgresql/transaction.entity';
import { CreateTransactionTable1704153600000 } from './database/migrations/1704153600000-CreateTransactionTable';
import { DatabaseService } from './database/database.service';

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
            entities: [TransactionEntity],
            migrations: [CreateTransactionTable1704153600000],
            migrationsRun: false, // Executar manualmente via DatabaseService
            synchronize: false,
          }),
        ]
      : []),
    TransactionsModule,
  ],
  providers: [DatabaseService],
})
export class AppModule {
  constructor(private databaseService: DatabaseService) {}

  async onModuleInit() {
    if (process.env.DB_MODE === 'postgres') {
      await this.databaseService.runMigrations();
    }
  }
}
