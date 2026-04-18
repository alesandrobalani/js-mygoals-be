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

  async findById(id: string): Promise<Transaction | null> {
    return this.transactions.find(transaction => transaction.id === id) ?? null;
  }

  async existsByAccountId(accountId: string): Promise<boolean> {
    return this.transactions.some(transaction => transaction.account.id === accountId);
  }

  async existsByTransactionItemId(transactionItemId: string): Promise<boolean> {
    return this.transactions.some(transaction => transaction.transactionItem.id === transactionItemId);
  }
}
