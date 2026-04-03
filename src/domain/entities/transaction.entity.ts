import { TransactionType } from '../../dto/create-transaction.dto';
import { Category } from './category.entity';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly description: string,
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly category: Category,
    public readonly transactionDate: Date,
    public readonly account: string,
    public readonly createdAt: Date,
    public readonly dueDate: Date,
  ) {}
}
