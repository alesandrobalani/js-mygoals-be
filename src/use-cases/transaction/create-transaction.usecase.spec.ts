import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories, seedTestCategories } from '../../test-utils/test-datasource';
import { PostgreSQLTransactionRepository } from '../../infrastructure/persistence/postgresql/transaction.repository';
import { PostgreSQLTransactionItemRepository } from '../../infrastructure/persistence/postgresql/transaction-item.repository';
import { PostgreSQLCategoryRepository } from '../../infrastructure/persistence/postgresql/category.repository';
import { PostgreSQLAccountRepository } from '../../infrastructure/persistence/postgresql/account.repository';
import { TransactionEntity } from '../../infrastructure/persistence/postgresql/transaction.entity';
import { AccountEntity } from '../../infrastructure/persistence/postgresql/account.entity';
import { TransactionItemEntity } from '../../infrastructure/persistence/postgresql/transaction-item.entity';
import { CreateTransactionUseCase } from './create-transaction.usecase';
import { TransactionType } from '../../dto/create-transaction.dto';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { randomUUID } from 'crypto';

describe('CreateTransactionUseCase', () => {
  let dataSource: DataSource;
  let transactionRepository: PostgreSQLTransactionRepository;
  let transactionItemRepository: PostgreSQLTransactionItemRepository;
  let categoryRepository: PostgreSQLCategoryRepository;
  let accountRepository: PostgreSQLAccountRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    const repos = createTestRepositories(dataSource);
    transactionRepository = repos.transactionRepository;
    transactionItemRepository = repos.transactionItemRepository;
    categoryRepository = repos.categoryRepository;
    accountRepository = repos.accountRepository;
    await seedTestCategories(dataSource);
  });

  afterAll(async () => { await dataSource.destroy(); });

  beforeEach(async () => {
    await dataSource.getRepository(TransactionEntity).clear();
    await dataSource.getRepository(AccountEntity).clear();
    await dataSource.getRepository(TransactionItemEntity).clear();
  });

  it('should create a transaction', async () => {
    const useCase = new CreateTransactionUseCase(
      transactionRepository as any,
      categoryRepository as any,
      accountRepository as any,
      transactionItemRepository as any,
    );

    const transactionDate = new Date('2024-12-01');

    const account = await accountRepository.create({ id: randomUUID(), name: 'Main Account', description: 'Primary account', updatedAt: new Date() });
    const transactionItem = await transactionItemRepository.create(new TransactionItem(randomUUID(), 'Item de Teste', 'Item para transaÃ§Ã£o', new Date()));

    const payload = {
      description: 'Salary',
      amount: 1000,
      type: TransactionType.INCOME,
      categoryId: '9',
      transactionItemId: transactionItem.id,
      accountId: account.id,
      transactionDate,
      settled: false,
    };

    const transaction = await useCase.execute(payload as any);

    expect(transaction).toMatchObject({
      description: 'Salary',
      amount: 1000,
      type: TransactionType.INCOME,
      category: expect.objectContaining({ id: '9', name: 'Renda Ativa' }),
      account: expect.objectContaining({ id: account.id, name: 'Main Account' }),
    });
    expect(transaction.id).toBeDefined();
    expect(transaction.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a transaction with dueDate', async () => {
    const useCase = new CreateTransactionUseCase(
      transactionRepository as any,
      categoryRepository as any,
      accountRepository as any,
      transactionItemRepository as any,
    );

    const dueDate = new Date('2024-12-31');
    const transactionDate = new Date('2024-12-01');
    const account = await accountRepository.create({ id: randomUUID(), name: 'Credit Card', description: 'Card account', updatedAt: new Date() });
    const transactionItem = await transactionItemRepository.create(new TransactionItem(randomUUID(), 'Item de Contas', 'Item para pagamento', new Date()));

    const payload = {
      description: 'Bill',
      amount: 200,
      type: TransactionType.EXPENSE,
      categoryId: '2',
      transactionItemId: transactionItem.id,
      accountId: account.id,
      transactionDate,
      dueDate,
      settled: true,
    };

    const transaction = await useCase.execute(payload as any);

    expect(transaction).toMatchObject({
      description: 'Bill',
      amount: 200,
      type: TransactionType.EXPENSE,
      category: expect.objectContaining({ id: '2' }),
      account: expect.objectContaining({ id: account.id, name: 'Credit Card' }),
    });
    expect(transaction.id).toBeDefined();
    expect(transaction.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a transaction without description', async () => {
    const useCase = new CreateTransactionUseCase(
      transactionRepository as any,
      categoryRepository as any,
      accountRepository as any,
      transactionItemRepository as any,
    );

    const transactionDate = new Date('2024-12-01');
    const account = await accountRepository.create({ id: randomUUID(), name: 'Savings Account', description: 'Savings account', updatedAt: new Date() });
    const transactionItem = await transactionItemRepository.create(new TransactionItem(randomUUID(), 'Item sem descriÃ§Ã£o', 'Item opcional', new Date()));

    const payload = {
      amount: 500,
      type: TransactionType.INCOME,
      categoryId: '9',
      transactionItemId: transactionItem.id,
      accountId: account.id,
      transactionDate,
      settled: false,
    };

    const transaction = await useCase.execute(payload as any);

    expect(transaction).toMatchObject({
      amount: 500,
      type: TransactionType.INCOME,
      category: expect.objectContaining({ id: '9', name: 'Renda Ativa' }),
      account: expect.objectContaining({ id: account.id, name: 'Savings Account' }),
    });
    expect(transaction.id).toBeDefined();
    expect(transaction.updatedAt).toBeInstanceOf(Date);
  });
});
