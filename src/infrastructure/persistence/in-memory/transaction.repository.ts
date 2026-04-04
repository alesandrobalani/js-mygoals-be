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

  async findByAccountId(accountId: string): Promise<Transaction[]> {
    return this.transactions.filter(transaction => transaction.account.id === accountId);
  }

  async findByTransactionItemId(transactionItemId: string): Promise<Transaction[]> {
    return this.transactions.filter(transaction => transaction.transactionItem.id === transactionItemId);
  }
}
