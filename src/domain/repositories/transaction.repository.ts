import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';

export interface TransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  findAll(): Promise<Transaction[]>;
  findByAccountId(accountId: string): Promise<Transaction[]>;
}
