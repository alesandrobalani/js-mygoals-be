import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories, seedTestCategories } from '../../test-utils/test-datasource';
import { PostgreSQLTransactionRepository } from '../../infrastructure/persistence/postgresql/transaction.repository';
import { PostgreSQLAccountRepository } from '../../infrastructure/persistence/postgresql/account.repository';
import { PostgreSQLTransactionItemRepository } from '../../infrastructure/persistence/postgresql/transaction-item.repository';
import { TransactionEntity } from '../../infrastructure/persistence/postgresql/transaction.entity';
import { GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase } from './get-transactions-summary-by-period.usecase';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Account } from '../../domain/entities/account.entity';
import { Category } from '../../domain/entities/category.entity';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { TransactionType } from '../../dto/create-transaction.dto';
import { randomUUID } from 'crypto';

describe('GetTransactionsSummaryByPeriodUseCase', () => {
  let dataSource: DataSource;
  let repo: PostgreSQLTransactionRepository;
  let sharedAccount: Account;
  let sharedCategory: Category;
  let sharedItem: TransactionItem;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    const repos = createTestRepositories(dataSource);
    repo = repos.transactionRepository;
    await seedTestCategories(dataSource);

    sharedAccount = await repos.accountRepository.create(new Account(randomUUID(), 'Conta Resumo', undefined, new Date()));
    sharedCategory = new Category('1', 'HabitaÃ§Ã£o', 'Despesas relacionadas Ã  moradia', new Date());
    sharedItem = await repos.transactionItemRepository.create(new TransactionItem(randomUUID(), 'Item Resumo', undefined, new Date()));
  });

  afterAll(async () => { await dataSource.destroy(); });
  beforeEach(async () => { await dataSource.getRepository(TransactionEntity).clear(); });

  const makeTransaction = (type: TransactionType, amount: number, transactionDate: Date, settled: Boolean): Transaction =>
    new Transaction(
      randomUUID(), 'desc', amount, type,
      sharedCategory, sharedItem, transactionDate, sharedAccount, new Date(), transactionDate, settled,
    );

  it('should return zeros when no transactions exist in period', async () => {
    const useCase = new GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase(repo as any);

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'));

    expect(result).toEqual({ incomeSettled: 0, incomeNotSettled: 0, expenseSettled: 0, expenseNotSettled: 0 });
  });

  it('should sum only income transactions in period', async () => {
    const useCase = new GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase(repo as any);

    await repo.create(makeTransaction(TransactionType.INCOME, 1000, new Date('2024-06-15'), true));
    await repo.create(makeTransaction(TransactionType.INCOME, 500, new Date('2024-08-20'), false));

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'));

    expect(result.incomeSettled).toBe(1000);
    expect(result.incomeNotSettled).toBe(500);
    expect(result.expenseSettled).toBe(0);
    expect(result.expenseNotSettled).toBe(0);
  });

  it('should sum only expense transactions in period', async () => {
    const useCase = new GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase(repo as any);

    await repo.create(makeTransaction(TransactionType.EXPENSE, 200, new Date('2024-03-10'), true));
    await repo.create(makeTransaction(TransactionType.EXPENSE, 300, new Date('2024-07-05'), false));

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'));

    expect(result.incomeSettled).toBe(0);
    expect(result.incomeNotSettled).toBe(0);
    expect(result.expenseSettled).toBe(200);
    expect(result.expenseNotSettled).toBe(300);
  });

  it('should sum both income and expense transactions correctly', async () => {
    const useCase = new GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase(repo as any);

    await repo.create(makeTransaction(TransactionType.INCOME, 3000, new Date('2024-01-15'), true));
    await repo.create(makeTransaction(TransactionType.INCOME, 2000, new Date('2024-06-01'), false));
    await repo.create(makeTransaction(TransactionType.EXPENSE, 800, new Date('2024-02-20'), true));
    await repo.create(makeTransaction(TransactionType.EXPENSE, 1200, new Date('2024-09-10'), false));

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'));

    expect(result.incomeSettled).toBe(3000);
    expect(result.incomeNotSettled).toBe(2000);
    expect(result.expenseSettled).toBe(800);
    expect(result.expenseNotSettled).toBe(1200);
  });

  it('should not count transactions outside the period', async () => {
    const useCase = new GetTransactionsSummaryByPeriodGroupByTrasactionTypeUseCase(repo as any);

    await repo.create(makeTransaction(TransactionType.INCOME, 9999, new Date('2023-06-15'), false));
    await repo.create(makeTransaction(TransactionType.INCOME, 1000, new Date('2024-06-15'), false));
    await repo.create(makeTransaction(TransactionType.EXPENSE, 9999, new Date('2025-06-15'), true));
    await repo.create(makeTransaction(TransactionType.EXPENSE, 400, new Date('2024-03-20'), true));

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'));

    expect(result.incomeSettled).toBe(0);
    expect(result.incomeNotSettled).toBe(1000);
    expect(result.expenseSettled).toBe(400);
    expect(result.expenseNotSettled).toBe(0);
  });
});
