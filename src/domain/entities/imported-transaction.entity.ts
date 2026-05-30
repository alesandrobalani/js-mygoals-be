import { TransactionType } from '../../dto/create-transaction.dto';

export class ImportedTransaction {
  constructor(
    readonly id: string,
    readonly fileImportId: string,
    readonly rawText: string,
    readonly description: string | null,
    readonly amount: number | null,
    readonly type: TransactionType | null,
    readonly categoryId: string | null,
    readonly accountId: string | null,
    readonly transactionItemId: string | null,
    readonly transactionDate: Date | null,
    readonly dueDate: Date | null,
    readonly settled: boolean | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}
