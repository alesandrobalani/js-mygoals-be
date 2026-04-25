import { Transaction } from '../entities/transaction.entity';

export interface TransactionByTypeSummary {
  income: number;
  expense: number;
}

export interface TransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  findAll(): Promise<Transaction[]>;
  findById(id: string): Promise<Transaction | null>;
  existsByAccountId(accountId: string): Promise<boolean>;
  existsByTransactionItemId(transactionItemId: string): Promise<boolean>;
  findSumByPeriodGroupByType(startDate: Date, endDate: Date): Promise<TransactionByTypeSummary>;
}
