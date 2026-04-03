import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';

export interface TransactionRepository {
  create(transaction: CreateTransactionDto): Promise<Transaction>;
  findAll(): Promise<Transaction[]>;
}
