import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';

export interface TransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  findAll(): Promise<Transaction[]>;
  findById(id: string): Promise<Transaction | null>;
  findByAccountId(accountId: string): Promise<Transaction[]>;
  findByTransactionItemId(transactionItemId: string): Promise<Transaction[]>;
}
