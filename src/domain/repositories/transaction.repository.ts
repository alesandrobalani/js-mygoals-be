import { Transaction } from '../entities/transaction.entity';
import { TransactionType } from '../../dto/create-transaction.dto';

export interface StrategicViewTransaction {
  amount: number;
  type: TransactionType;
  categoryName: string;
  itemName: string;
  transactionDate: Date;
  dueDate: Date;
  settled: Boolean;
}

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

export interface TransactionByAccountAndTypeAndSettledSummary {
    accountName: string
    incomeSettled: number;
    incomeNotSettled: number;
    expenseSettled: number;
    expenseNotSettled: number;
}

export interface TransferResult {
  debit: Transaction;
  credit: Transaction;
}

export interface TransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  createPair(debit: Transaction, credit: Transaction): Promise<TransferResult>;
  update(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  existsByAccountId(accountId: string): Promise<boolean>;
  existsByTransactionItemId(transactionItemId: string): Promise<boolean>;
  findSumByPeriodGroupByTypeAndSettled(startDate: Date, endDate: Date): Promise<TransactionByTypeAndSettledSummary>;
  findSumGroupByAccountAndTypeAndSettled(endDate: Date): Promise<TransactionByAccountAndTypeAndSettledSummary[]>;
  findByPeriod(startDate: Date, endDate: Date, page: number, limit: number): Promise<PaginatedTransactions>;
  findAllByPeriod(startDate: Date, endDate: Date): Promise<Transaction[]>;
  delete(id: string): Promise<void>;
}
