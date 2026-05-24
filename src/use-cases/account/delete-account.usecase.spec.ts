import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories, seedTestCategories } from '../../test-utils/test-datasource';
import { PostgreSQLAccountRepository } from '../../infrastructure/persistence/postgresql/account.repository';
import { PostgreSQLTransactionRepository } from '../../infrastructure/persistence/postgresql/transaction.repository';
import { PostgreSQLTransactionItemRepository } from '../../infrastructure/persistence/postgresql/transaction-item.repository';
import { AccountEntity } from '../../infrastructure/persistence/postgresql/account.entity';
import { TransactionEntity } from '../../infrastructure/persistence/postgresql/transaction.entity';
import { TransactionItemEntity } from '../../infrastructure/persistence/postgresql/transaction-item.entity';
import { DeleteAccountUseCase } from './delete-account.usecase';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { Category } from '../../domain/entities/category.entity';
import { TransactionType } from '../../dto/create-transaction.dto';
import { randomUUID } from 'crypto';
import { Account } from '../../domain/entities/account.entity';

describe('DeleteAccountUseCase', () => {
  let dataSource: DataSource;
  let accountRepository: PostgreSQLAccountRepository;
  let transactionRepository: PostgreSQLTransactionRepository;
  let transactionItemRepository: PostgreSQLTransactionItemRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    const repos = createTestRepositories(dataSource);
    accountRepository = repos.accountRepository;
    transactionRepository = repos.transactionRepository;
    transactionItemRepository = repos.transactionItemRepository;
    await seedTestCategories(dataSource);
  });

  afterAll(async () => { await dataSource.destroy(); });

  beforeEach(async () => {
    await dataSource.getRepository(TransactionEntity).clear();
    await dataSource.getRepository(AccountEntity).clear();
    await dataSource.getRepository(TransactionItemEntity).clear();
  });

  it('should delete an account successfully', async () => {
    const useCase = new DeleteAccountUseCase(accountRepository as any, transactionRepository as any);

    const account = await accountRepository.create({
      id: randomUUID(),
      name: 'Test Account',
      description: 'Account for deletion test',
      updatedAt: new Date(),
    });

    await useCase.execute(account.id);

    const foundAccount = await accountRepository.findById(account.id);
    expect(foundAccount).toBeNull();
  });

  it('should throw error when account not found', async () => {
    const useCase = new DeleteAccountUseCase(accountRepository as any, transactionRepository as any);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow('Account with ID "non-existent-id" not found');
  });

  it('should not allow deleting an account with associated transactions', async () => {
    const useCase = new DeleteAccountUseCase(accountRepository as any, transactionRepository as any);

    const account = await accountRepository.create({
      id: randomUUID(),
      name: 'Account With Transaction',
      description: 'Account that has transactions',
      updatedAt: new Date(),
    });

    const txItem = await transactionItemRepository.create(
      new TransactionItem(randomUUID(), 'Expense Item', 'Item for account delete test', new Date()),
    );

    await transactionRepository.create(new Transaction(
      randomUUID(), 'Test Transaction', 100, TransactionType.EXPENSE,
      new Category('1', 'HabitaÃ§Ã£o', 'Despesas relacionadas Ã  moradia', new Date()),
      txItem, new Date(), account, new Date(), new Date(), true,
    ));

    await expect(useCase.execute(account.id)).rejects.toThrow(
      'Cannot delete account "Account With Transaction" because it has associated transactions',
    );
  });
});
