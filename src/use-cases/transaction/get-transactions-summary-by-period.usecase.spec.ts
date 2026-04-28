import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';
import { GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase } from './get-transactions-summary-by-period.usecase';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Account } from '../../domain/entities/account.entity';
import { Category } from '../../domain/entities/category.entity';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { TransactionType } from '../../dto/create-transaction.dto';
import { randomUUID } from 'crypto';

const makeTransaction = (
  type: TransactionType,
  amount: number,
  transactionDate: Date,
): Transaction => {
  const account = new Account('acc1', 'Conta', undefined, new Date());
  const category = new Category('cat1', 'Categoria', undefined, new Date());
  const item = new TransactionItem('item1', 'Item', undefined, new Date());
  return new Transaction(
    randomUUID(), 'desc', amount, type, category, item,
    transactionDate, account, new Date(), transactionDate, true
  );
};

describe('GetTransactionsSummaryByPeriodUseCase', () => {
  it('should return zeros when no transactions exist in period', async () => {
    const repo = new InMemoryTransactionRepository();
    const useCase = new GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase(repo as any);

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'));

    expect(result).toEqual({ income: 0, expense: 0 });
  });

  it('should sum only income transactions in period', async () => {
    const repo = new InMemoryTransactionRepository();
    const useCase = new GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase(repo as any);

    await repo.create(makeTransaction(TransactionType.INCOME, 1000, new Date('2024-06-15')));
    await repo.create(makeTransaction(TransactionType.INCOME, 500, new Date('2024-08-20')));

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'));

    expect(result.income).toBe(1500);
    expect(result.expense).toBe(0);
  });

  it('should sum only expense transactions in period', async () => {
    const repo = new InMemoryTransactionRepository();
    const useCase = new GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase(repo as any);

    await repo.create(makeTransaction(TransactionType.EXPENSE, 200, new Date('2024-03-10')));
    await repo.create(makeTransaction(TransactionType.EXPENSE, 300, new Date('2024-07-05')));

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'));

    expect(result.income).toBe(0);
    expect(result.expense).toBe(500);
  });

  it('should sum both income and expense transactions correctly', async () => {
    const repo = new InMemoryTransactionRepository();
    const useCase = new GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase(repo as any);

    await repo.create(makeTransaction(TransactionType.INCOME, 3000, new Date('2024-01-15')));
    await repo.create(makeTransaction(TransactionType.INCOME, 2000, new Date('2024-06-01')));
    await repo.create(makeTransaction(TransactionType.EXPENSE, 800, new Date('2024-02-20')));
    await repo.create(makeTransaction(TransactionType.EXPENSE, 1200, new Date('2024-09-10')));

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'));

    expect(result.income).toBe(5000);
    expect(result.expense).toBe(2000);
  });

  it('should not count transactions outside the period', async () => {
    const repo = new InMemoryTransactionRepository();
    const useCase = new GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase(repo as any);

    await repo.create(makeTransaction(TransactionType.INCOME, 9999, new Date('2023-12-31')));
    await repo.create(makeTransaction(TransactionType.INCOME, 1000, new Date('2024-06-15')));
    await repo.create(makeTransaction(TransactionType.EXPENSE, 9999, new Date('2025-01-01')));
    await repo.create(makeTransaction(TransactionType.EXPENSE, 400, new Date('2024-03-20')));

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'));

    expect(result.income).toBe(1000);
    expect(result.expense).toBe(400);
  });
});
