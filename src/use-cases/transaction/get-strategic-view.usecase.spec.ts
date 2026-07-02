import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories, seedTestCategories } from '../../test-utils/test-datasource';
import { PostgreSQLTransactionRepository } from '../../infrastructure/persistence/postgresql/transaction.repository';
import { PostgreSQLAccountRepository } from '../../infrastructure/persistence/postgresql/account.repository';
import { PostgreSQLTransactionItemRepository } from '../../infrastructure/persistence/postgresql/transaction-item.repository';
import { TransactionEntity } from '../../infrastructure/persistence/postgresql/transaction.entity';
import { GetStrategicViewUseCase } from './get-strategic-view.usecase';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Account } from '../../domain/entities/account.entity';
import { Category } from '../../domain/entities/category.entity';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { TransactionType } from '../../dto/create-transaction.dto';
import { randomUUID } from 'crypto';

describe('GetStrategicViewUseCase', () => {
  let dataSource: DataSource;
  let repo: PostgreSQLTransactionRepository;
  let accountRepo: PostgreSQLAccountRepository;
  let sharedAccount: Account;
  let sharedCategory: Category;
  let sharedItem: TransactionItem;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    const repos = createTestRepositories(dataSource);
    repo = repos.transactionRepository;
    accountRepo = repos.accountRepository;
    await seedTestCategories(dataSource);

    sharedAccount = await accountRepo.create(new Account(randomUUID(), 'Conta Corrente', undefined, new Date()));
    sharedCategory = new Category('1', 'Habitação', 'Despesas de moradia', new Date());
    sharedItem = await repos.transactionItemRepository.create(new TransactionItem(randomUUID(), 'Aluguel mensal', undefined, new Date()));
  });

  afterAll(async () => { await dataSource.destroy(); });
  beforeEach(async () => { await dataSource.getRepository(TransactionEntity).clear(); });

  const makeTransaction = (amount: number, date: Date, type = TransactionType.EXPENSE): Transaction =>
    new Transaction(
      randomUUID(), 'desc', amount, type,
      sharedCategory, sharedItem, date, sharedAccount, new Date(), date, true,
    );

  it('should return empty array when no transactions exist in period', async () => {
    const useCase = new GetStrategicViewUseCase(repo as any);

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'));

    expect(result).toHaveLength(0);
  });

  it('should return only transactions within the period', async () => {
    const useCase = new GetStrategicViewUseCase(repo as any);

    await repo.create(makeTransaction(100, new Date('2024-03-15')));
    await repo.create(makeTransaction(200, new Date('2024-07-20')));
    await repo.create(makeTransaction(999, new Date('2023-06-15')));
    await repo.create(makeTransaction(999, new Date('2025-06-15')));

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'));

    expect(result).toHaveLength(2);
  });

  it('should resolve reference names instead of IDs', async () => {
    const useCase = new GetStrategicViewUseCase(repo as any);

    await repo.create(makeTransaction(500, new Date('2024-06-10')));

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'));

    expect(result).toHaveLength(1);
    expect(result[0].categoryName).toBe('Habitação');
    expect(result[0].accountName).toBe('Conta Corrente');
    expect(result[0].itemName).toBe('Aluguel mensal');
    expect(result[0]).not.toHaveProperty('category');
    expect(result[0]).not.toHaveProperty('account');
    expect(result[0]).not.toHaveProperty('transactionItem');
  });

  it('should return correct flat fields for each transaction', async () => {
    const useCase = new GetStrategicViewUseCase(repo as any);

    await repo.create(makeTransaction(1500, new Date('2024-04-05'), TransactionType.INCOME));

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'));

    expect(result[0]).toMatchObject({
      amount: 1500,
      type: TransactionType.INCOME,
      categoryName: 'Habitação',
      accountName: 'Conta Corrente',
      itemName: 'Aluguel mensal',
      settled: true,
    });
    expect(result[0].id).toBeDefined();
    expect(result[0].transactionDate).toBeDefined();
    expect(result[0].dueDate).toBeDefined();
  });

  it('should return results ordered by dueDate descending', async () => {
    const useCase = new GetStrategicViewUseCase(repo as any);

    await repo.create(makeTransaction(100, new Date('2024-01-10')));
    await repo.create(makeTransaction(200, new Date('2024-06-15')));
    await repo.create(makeTransaction(300, new Date('2024-03-20')));

    const result = await useCase.execute(new Date('2024-01-01'), new Date('2024-12-31'));

    expect(result[0].amount).toBe(200);
    expect(result[1].amount).toBe(300);
    expect(result[2].amount).toBe(100);
  });

  it('should throw when repository throws', async () => {
    const failingRepo = {
      findAllByPeriod: jest.fn().mockRejectedValue(new Error('DB connection failed')),
    };
    const useCase = new GetStrategicViewUseCase(failingRepo as any);

    await expect(useCase.execute(new Date('2024-01-01'), new Date('2024-12-31')))
      .rejects.toThrow('DB connection failed');
  });
});
