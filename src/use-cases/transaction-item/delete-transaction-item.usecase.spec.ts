import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories, seedTestCategories } from '../../test-utils/test-datasource';
import { PostgreSQLTransactionItemRepository } from '../../infrastructure/persistence/postgresql/transaction-item.repository';
import { PostgreSQLTransactionRepository } from '../../infrastructure/persistence/postgresql/transaction.repository';
import { PostgreSQLAccountRepository } from '../../infrastructure/persistence/postgresql/account.repository';
import { TransactionItemEntity } from '../../infrastructure/persistence/postgresql/transaction-item.entity';
import { TransactionEntity } from '../../infrastructure/persistence/postgresql/transaction.entity';
import { AccountEntity } from '../../infrastructure/persistence/postgresql/account.entity';
import { DeleteTransactionItemUseCase } from './delete-transaction-item.usecase';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Account } from '../../domain/entities/account.entity';
import { Category } from '../../domain/entities/category.entity';
import { TransactionType } from '../../dto/create-transaction.dto';
import { randomUUID } from 'crypto';

describe('DeleteTransactionItemUseCase', () => {
  let dataSource: DataSource;
  let transactionItemRepository: PostgreSQLTransactionItemRepository;
  let transactionRepository: PostgreSQLTransactionRepository;
  let accountRepository: PostgreSQLAccountRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    const repos = createTestRepositories(dataSource);
    transactionItemRepository = repos.transactionItemRepository;
    transactionRepository = repos.transactionRepository;
    accountRepository = repos.accountRepository;
    await seedTestCategories(dataSource);
  });

  afterAll(async () => { await dataSource.destroy(); });

  beforeEach(async () => {
    await dataSource.getRepository(TransactionEntity).clear();
    await dataSource.getRepository(AccountEntity).clear();
    await dataSource.getRepository(TransactionItemEntity).clear();
  });

  it('should delete a transaction item if no transactions are using it', async () => {
    const useCase = new DeleteTransactionItemUseCase(transactionItemRepository as any, transactionRepository as any);

    const item = await transactionItemRepository.create(new TransactionItem(randomUUID(), 'Test Item', 'Desc', new Date()));

    await expect(useCase.execute(item.id)).resolves.toBeUndefined();

    const found = await transactionItemRepository.findById(item.id);
    expect(found).toBeNull();
  });

  it('should throw an error if the transaction item is used by transactions', async () => {
    const useCase = new DeleteTransactionItemUseCase(transactionItemRepository as any, transactionRepository as any);

    const item = await transactionItemRepository.create(new TransactionItem(randomUUID(), 'Test Item', 'Desc', new Date()));
    const account = await accountRepository.create(new Account(randomUUID(), 'Account', 'Desc', new Date()));

    await transactionRepository.create(new Transaction(
      randomUUID(), 'Transaction desc', 100, TransactionType.INCOME,
      new Category('1', 'HabitaÃ§Ã£o', 'Despesas relacionadas Ã  moradia', new Date()),
      item, new Date(), account, new Date(), new Date(), true,
    ));

    await expect(useCase.execute(item.id)).rejects.toThrow(
      'Cannot delete transaction item because it is used by one or more transactions',
    );
  });

  it('should throw an error if the transaction item does not exist', async () => {
    const useCase = new DeleteTransactionItemUseCase(transactionItemRepository as any, transactionRepository as any);

    await expect(useCase.execute('nonexistent')).rejects.toThrow();
  });
});
