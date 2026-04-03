export class Transaction {
  constructor(
    public readonly id: string,
    public readonly description: string,
    public readonly amount: number,
    public readonly type: 'income' | 'expense',
    public readonly category: string,
    public readonly createdAt: Date,
  ) {}
}
