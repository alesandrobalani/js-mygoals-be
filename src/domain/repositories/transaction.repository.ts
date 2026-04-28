import { Transaction } from '../entities/transaction.entity';

export interface TransactionByTypeAndSettledSummary {
  incomeSettled: number;
  incomeNotSettled: number;
  expenseSettled: number;
  expenseNotSettled: number;
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
  findById(id: string): Promise<Transaction | null>;
  existsByAccountId(accountId: string): Promise<boolean>;
  existsByTransactionItemId(transactionItemId: string): Promise<boolean>;
  findSumByPeriodGroupByTypeAndSettled(startDate: Date, endDate: Date): Promise<TransactionByTypeAndSettledSummary>;
  findByPeriod(startDate: Date, endDate: Date, page: number, limit: number): Promise<PaginatedTransactions>;
}
