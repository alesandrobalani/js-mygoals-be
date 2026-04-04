export class TransactionItem {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly updatedAt: Date,
  ) {}
}
