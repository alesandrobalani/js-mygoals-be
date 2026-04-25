import { Injectable } from '@nestjs/common';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { TransactionRepository, TransactionByTypeSummary, PaginatedTransactions } from '../../../domain/repositories/transaction.repository';
import { TransactionType } from '../../../dto/create-transaction.dto';

@Injectable()
export class InMemoryTransactionRepository implements TransactionRepository {
  private transactions: Transaction[] = [];
  
  clear(): void {
    this.transactions = [];
  }
  
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

  async findByPeriod(startDate: Date, endDate: Date, page: number, limit: number): Promise<PaginatedTransactions> {
    const filtered = this.transactions
      .filter(t => t.transactionDate >= startDate && t.transactionDate <= endDate)
      .sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());

    const total = filtered.length;
    const skip = (page - 1) * limit;
    const data = filtered.slice(skip, skip + limit);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findSumByPeriodGroupByType(startDate: Date, endDate: Date): Promise<TransactionByTypeSummary> {
    const filtered = this.transactions.filter(
      t => t.transactionDate >= startDate && t.transactionDate <= endDate,
    );
    return filtered.reduce(
      (acc, t) => {
        if (t.type === TransactionType.INCOME) acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 },
    );
  }
}
