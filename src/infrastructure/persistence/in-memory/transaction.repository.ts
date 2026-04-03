import { Injectable } from '@nestjs/common';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { TransactionRepository } from '../../../domain/repositories/transaction.repository';

@Injectable()
export class InMemoryTransactionRepository implements TransactionRepository {
  private transactions: Transaction[] = [];

  async create(transaction: Transaction): Promise<Transaction> {    
    this.transactions.push(transaction);
    return transaction;
  }

  async findAll(): Promise<Transaction[]> {
    return [...this.transactions];
  }
}
