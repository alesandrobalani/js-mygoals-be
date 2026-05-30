import { ImportedTransaction } from '../entities/imported-transaction.entity';

export interface ImportedTransactionRepository {
  createMany(transactions: ImportedTransaction[]): Promise<ImportedTransaction[]>;
  findByFileImportId(fileImportId: string): Promise<ImportedTransaction[]>;
}
