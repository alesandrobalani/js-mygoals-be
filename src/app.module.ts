import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { TransactionEntity } from './infrastructure/persistence/postgresql/transaction.entity';

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
            synchronize: true, // Para desenvolvimento; em produção, use migrations
          }),
        ]
      : []),
    TransactionsModule,
  ],
})
export class AppModule {}
