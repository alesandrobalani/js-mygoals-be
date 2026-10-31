import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionRepository } from '../../domain/repositories/transaction.repository';
import {
  CopyTransactionsCreatedItem,
  CopyTransactionsResult,
  CopyTransactionsSkippedItem,
} from '../../dto/copy-transactions.dto';
import { addMonthsClamped, fromDateOnly, monthsBetween, toDateOnly, toYearMonth } from '../../utils/date-only';

export interface CopyTransactionsInput {
  transactionIds: string[];
  targetMonths: string[];
  dryRun?: boolean;
}

interface DuplicateKeyFields {
  account: { id: string };
  category: { id: string };
  transactionItem: { id: string };
  type: string;
  amount: number | string;
  description?: string | null;
}

@Injectable()
export class CopyTransactionsUseCase {
  private readonly logger = new Logger(CopyTransactionsUseCase.name);

  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(input: CopyTransactionsInput): Promise<CopyTransactionsResult> {
    const dryRun = input.dryRun ?? false;
    this.logger.log(
      `Copying ${input.transactionIds.length} transactions to ${input.targetMonths.length} months (dryRun=${dryRun})`,
      'CopyTransactionsUseCase',
    );

    const sources = await this.loadSources(input.transactionIds);

    const now = new Date();
    const copies = sources.flatMap(source =>
      input.targetMonths.map(targetMonth => ({ source, targetMonth, copy: this.buildCopy(source, targetMonth, now) })),
    );

    const existingKeys = await this.loadExistingKeys(copies.map(c => c.copy.dueDate));

    const created: CopyTransactionsCreatedItem[] = [];
    const skipped: CopyTransactionsSkippedItem[] = [];
    const toPersist: Transaction[] = [];

    for (const { source, targetMonth, copy } of copies) {
      const dueDate = toDateOnly(copy.dueDate);
      const key = this.duplicateKey(copy, dueDate);
      if (existingKeys.has(key)) {
        skipped.push({ sourceId: source.id, targetMonth, dueDate, reason: 'duplicate' });
        continue;
      }
      existingKeys.add(key);
      toPersist.push(copy);
      created.push({
        sourceId: source.id,
        targetMonth,
        description: copy.description,
        amount: copy.amount,
        type: copy.type,
        dueDate,
        transactionDate: toDateOnly(copy.transactionDate),
      });
    }

    if (!dryRun) {
      await this.transactionRepository.createMany(toPersist);
    }

    this.logger.log(`Copy finished: created=${created.length}, skipped=${skipped.length}, dryRun=${dryRun}`, 'CopyTransactionsUseCase');
    return { dryRun, created, skipped };
  }

  private async loadSources(ids: string[]): Promise<Transaction[]> {
    const found = await this.transactionRepository.findByIds(ids);
    const byId = new Map(found.map(t => [t.id, t]));

    const notFoundIds = ids.filter(id => !byId.has(id));
    if (notFoundIds.length > 0) {
      throw new NotFoundException({
        statusCode: 404,
        message: `Transactions not found: ${notFoundIds.join(', ')}`,
        notFoundIds,
      });
    }

    const sources = ids.map(id => byId.get(id)!);
    const transferIds = sources.filter(t => t.category.isTransfer).map(t => t.id);
    if (transferIds.length > 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: `Transfer transactions cannot be copied: ${transferIds.join(', ')}`,
        transferIds,
      });
    }

    return sources;
  }

  private buildCopy(source: Transaction, targetMonth: string, now: Date): Transaction {
    const offset = monthsBetween(toYearMonth(source.dueDate), targetMonth);
    return new Transaction(
      randomUUID(),
      source.description,
      Number(source.amount),
      source.type,
      source.category,
      source.transactionItem,
      fromDateOnly(addMonthsClamped(source.transactionDate, offset)),
      source.account,
      now,
      fromDateOnly(addMonthsClamped(source.dueDate, offset)),
      false,
    );
  }

  private async loadExistingKeys(dueDates: Date[]): Promise<Set<string>> {
    const keys = new Set<string>();
    if (dueDates.length === 0) return keys;

    const sorted = dueDates.map(d => toDateOnly(d)).sort();
    const candidates = await this.transactionRepository.findAllByDueDateRange(sorted[0], sorted[sorted.length - 1]);
    for (const candidate of candidates) {
      keys.add(this.duplicateKey(candidate, toDateOnly(candidate.dueDate)));
    }
    return keys;
  }

  private duplicateKey(t: DuplicateKeyFields, dueDate: string): string {
    const cents = Math.round(Number(t.amount) * 100);
    return JSON.stringify([t.account.id, t.category.id, t.transactionItem.id, t.type, cents, t.description ?? '', dueDate]);
  }
}
