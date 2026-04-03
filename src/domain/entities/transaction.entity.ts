import { TransactionType, TransactionCategory } from '../../dto/create-transaction.dto';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly description: string,
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly category: TransactionCategory,
    public readonly transactionDate: Date,
    public readonly account: string,
    public readonly createdAt: Date,
    public readonly dueDate: Date,
  ) {}
}
