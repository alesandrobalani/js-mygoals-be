import { TransactionItem } from '../entities/transaction-item.entity';

export interface TransactionItemRepository {
  create(item: TransactionItem): Promise<TransactionItem>;
  findAll(): Promise<TransactionItem[]>;
  findById(id: string): Promise<TransactionItem | null>;
  findByName(name: string): Promise<TransactionItem | null>;
  update(item: TransactionItem): Promise<TransactionItem>;
  delete(id: string): Promise<void>;
}
