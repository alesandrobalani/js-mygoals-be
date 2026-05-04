import { Injectable } from '@nestjs/common';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { TransactionRepository, TransactionByTypeAndSettledSummary, PaginatedTransactions } from '../../../domain/repositories/transaction.repository';
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

  async findSumByPeriodGroupByTypeAndSettled(startDate: Date, endDate: Date): Promise<TransactionByTypeAndSettledSummary> {
    const filtered = this.transactions.filter(
      t => t.transactionDate >= startDate && t.transactionDate <= endDate,
    );
    return filtered.reduce(
      (acc, t) => {
        if (t.type === TransactionType.INCOME && t.settled) acc.incomeSettled += t.amount;
        if (t.type === TransactionType.INCOME && !t.settled) acc.incomeNotSettled+= t.amount;
        if (t.type === TransactionType.EXPENSE && t.settled) acc.expenseSettled += t.amount;
        if (t.type === TransactionType.EXPENSE && !t.settled) acc.expenseNotSettled += t.amount;
        return acc;
      },
      { incomeSettled: 0, incomeNotSettled: 0, expenseSettled: 0, expenseNotSettled: 0 },
    );
  }
}
