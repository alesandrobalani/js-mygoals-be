import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories, seedTestCategories } from '../../test-utils/test-datasource';
import { PostgreSQLTransactionRepository } from '../../infrastructure/persistence/postgresql/transaction.repository';
import { PostgreSQLAccountRepository } from '../../infrastructure/persistence/postgresql/account.repository';
import { PostgreSQLTransactionItemRepository } from '../../infrastructure/persistence/postgresql/transaction-item.repository';
import { TransactionEntity } from '../../infrastructure/persistence/postgresql/transaction.entity';
import { FindTransactionsByPeriodUseCase } from './find-transactions-by-period.usecase';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Account } from '../../domain/entities/account.entity';
import { Category } from '../../domain/entities/category.entity';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { TransactionType } from '../../dto/create-transaction.dto';
import { randomUUID } from 'crypto';

describe('FindTransactionsByPeriodUseCase', () => {
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

    sharedAccount = await repos.accountRepository.create(new Account(randomUUID(), 'Conta Compartilhada', undefined, new Date()));
    sharedCategory = new Category('1', 'HabitaÃ§Ã£o', 'Despesas relacionadas Ã  moradia', new Date());
    sharedItem = await repos.transactionItemRepository.create(new TransactionItem(randomUUID(), 'Item Compartilhado', undefined, new Date()));
  });

  afterAll(async () => { await dataSource.destroy(); });
  beforeEach(async () => { await dataSource.getRepository(TransactionEntity).clear(); });

  const makeTransaction = (amount: number, transactionDate: Date): Transaction =>
    new Transaction(
      randomUUID(), 'desc', amount, TransactionType.INCOME,
      sharedCategory, sharedItem, transactionDate, sharedAccount, new Date(), transactionDate, true,
    );

  it('should return empty result when no transactions exist in period', async () => {
    const useCase = new FindTransactionsByPeriodUseCase(repo as any);

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'), 1, 20);

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(0);
  });

  it('should return only transactions within the period', async () => {
    const useCase = new FindTransactionsByPeriodUseCase(repo as any);

    await repo.create(makeTransaction(100, new Date('2024-03-15')));
    await repo.create(makeTransaction(200, new Date('2024-07-20')));
    await repo.create(makeTransaction(999, new Date('2023-06-15')));
    await repo.create(makeTransaction(999, new Date('2025-06-15')));

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'), 1, 20);

    expect(result.total).toBe(2);
    expect(result.data).toHaveLength(2);
  });

  it('should paginate results correctly', async () => {
    const useCase = new FindTransactionsByPeriodUseCase(repo as any);

    for (let i = 1; i <= 15; i++) {
      const month = String(((i - 1) % 12) + 1).padStart(2, '0');
      await repo.create(makeTransaction(i * 100, new Date(`2024-${month}-10`)));
    }

    const page1 = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'), 1, 10);
    const page2 = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'), 2, 10);

    expect(page1.total).toBe(15);
    expect(page1.data).toHaveLength(10);
    expect(page1.page).toBe(1);
    expect(page1.totalPages).toBe(2);
    expect(page2.data).toHaveLength(5);
    expect(page2.page).toBe(2);
  });

  it('should respect the max limit of 100 records', async () => {
    const useCase = new FindTransactionsByPeriodUseCase(repo as any);

    for (let i = 0; i < 150; i++) {
      await repo.create(makeTransaction(100, new Date('2024-06-15')));
    }

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'), 1, 100);

    expect(result.data).toHaveLength(100);
    expect(result.total).toBe(150);
    expect(result.totalPages).toBe(2);
  });

  it('should return results ordered by transactionDate descending', async () => {
    const useCase = new FindTransactionsByPeriodUseCase(repo as any);

    await repo.create(makeTransaction(100, new Date('2024-01-10')));
    await repo.create(makeTransaction(200, new Date('2024-06-15')));
    await repo.create(makeTransaction(300, new Date('2024-03-20')));

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'), 1, 20);

    expect(result.data[0].amount).toBe(200);
    expect(result.data[1].amount).toBe(300);
    expect(result.data[2].amount).toBe(100);
  });
});
