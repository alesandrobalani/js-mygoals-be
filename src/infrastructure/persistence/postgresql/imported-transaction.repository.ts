import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImportedTransaction } from '../../../domain/entities/imported-transaction.entity';
import { ImportedTransactionRepository } from '../../../domain/repositories/imported-transaction.repository';
import { ImportedTransactionEntity } from './imported-transaction.entity';

@Injectable()
export class PostgreSQLImportedTransactionRepository implements ImportedTransactionRepository {
  constructor(
    @InjectRepository(ImportedTransactionEntity)
    private readonly repo: Repository<ImportedTransactionEntity>,
  ) {}

  private toEntity(t: ImportedTransaction): ImportedTransactionEntity {
    const e = new ImportedTransactionEntity();
    e.id = t.id;
    e.fileImportId = t.fileImportId;
    e.rawText = t.rawText;
    e.description = t.description;
    e.amount = t.amount;
    e.type = t.type ?? undefined;
    e.categoryId = t.categoryId;
    e.accountId = t.accountId;
    e.transactionItemId = t.transactionItemId;
    e.transactionDate = t.transactionDate ?? undefined;
    e.dueDate = t.dueDate ?? undefined;
    e.settled = t.settled ?? undefined;
    return e;
  }

  private toDomain(e: ImportedTransactionEntity): ImportedTransaction {
    return new ImportedTransaction(
      e.id,
      e.fileImportId,
      e.rawText,
      e.description ?? null,
      e.amount != null ? Number(e.amount) : null,
      e.type ?? null,
      e.categoryId ?? null,
      e.accountId ?? null,
      e.transactionItemId ?? null,
      e.transactionDate ?? null,
      e.dueDate ?? null,
      e.settled ?? null,
      e.createdAt,
      e.updatedAt,
    );
  }

  async createMany(transactions: ImportedTransaction[]): Promise<ImportedTransaction[]> {
    if (transactions.length === 0) return [];
    const entities = transactions.map(t => this.toEntity(t));
    const saved = await this.repo.save(entities);
    return saved.map(e => this.toDomain(e));
  }

  async findByFileImportId(fileImportId: string): Promise<ImportedTransaction[]> {
    const entities = await this.repo.find({ where: { fileImportId } });
    return entities.map(e => this.toDomain(e));
  }
}
