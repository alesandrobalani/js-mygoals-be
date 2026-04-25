import { Transaction } from '../entities/transaction.entity';

export interface TransactionByTypeSummary {
  income: number;
  expense: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  findAll(): Promise<Transaction[]>;
  findById(id: string): Promise<Transaction | null>;
  existsByAccountId(accountId: string): Promise<boolean>;
  existsByTransactionItemId(transactionItemId: string): Promise<boolean>;
  findSumByPeriodGroupByType(startDate: Date, endDate: Date): Promise<TransactionByTypeSummary>;
  findByPeriod(startDate: Date, endDate: Date, page: number, limit: number): Promise<PaginatedTransactions>;
}
