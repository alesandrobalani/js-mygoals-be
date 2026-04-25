import { Injectable } from '@nestjs/common';
import { TransactionItem } from '../../../domain/entities/transaction-item.entity';
import { TransactionItemRepository } from '../../../domain/repositories/transaction-item.repository';

@Injectable()
export class InMemoryTransactionItemRepository implements TransactionItemRepository {
  private transactionItems: TransactionItem[] = [];

  clear(): void {
    this.transactionItems = [];
  }

  async create(item: TransactionItem): Promise<TransactionItem> {
    this.transactionItems.push(item);
    return item;
  }

  async findAll(): Promise<TransactionItem[]> {
    return [...this.transactionItems];
  }

  async findById(id: string): Promise<TransactionItem | null> {
    return this.transactionItems.find(item => item.id === id) ?? null;
  }

  async findByName(name: string): Promise<TransactionItem | null> {
    return this.transactionItems.find(item => item.name === name) ?? null;
  }

  async update(item: TransactionItem): Promise<TransactionItem> {
    const index = this.transactionItems.findIndex(existing => existing.id === item.id);
    if (index === -1) {
      throw new Error(`Transaction item with ID "${item.id}" not found`);
    }

    this.transactionItems[index] = item;
    return item;
  }

  async delete(id: string): Promise<void> {
    const index = this.transactionItems.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Transaction item with ID "${id}" not found`);
    }

    this.transactionItems.splice(index, 1);
  }
}
