import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';
import { InMemoryTransactionItemRepository } from '../../infrastructure/persistence/in-memory/transaction-item.repository';
import { InMemoryCategoryRepository } from '../../infrastructure/persistence/in-memory/category.repository';
import { InMemoryAccountRepository } from '../../infrastructure/persistence/in-memory/account.repository';
import { CreateTransactionUseCase } from './create-transaction.usecase';
import { TransactionType } from '../../dto/create-transaction.dto';
import { Category } from '../../domain/entities/category.entity';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';

describe('CreateTransactionUseCase', () => {
  it('should create a transaction', async () => {
    const transactionRepository = new InMemoryTransactionRepository();
    const transactionItemRepository = new InMemoryTransactionItemRepository();
    const categoryRepository = new InMemoryCategoryRepository();
    const accountRepository = new InMemoryAccountRepository();
    const useCase = new CreateTransactionUseCase(
      transactionRepository as any,
      categoryRepository as any,
      accountRepository as any,
      transactionItemRepository as any,
    );

    const transactionDate = new Date('2024-12-01');

    const account = await accountRepository.create({
      id: 'account-1',
      name: 'Main Account',
      description: 'Primary account',
      updatedAt: new Date(),
    });

    const transactionItem = await transactionItemRepository.create(
      new TransactionItem('test-item-1', 'Item de Teste', 'Item para transação', new Date()),
    );

    const payload = {
      description: 'Salary',
      amount: 1000,
      type: TransactionType.INCOME,
      categoryId: '9', // Renda Ativa
      transactionItemId: transactionItem.id,
      accountId: account.id,
      transactionDate: transactionDate,
    };

    const transaction = await useCase.execute(payload as any);

    expect(transaction).toMatchObject({
      description: 'Salary',
      amount: 1000,
      type: TransactionType.INCOME,
      category: expect.objectContaining({
        id: '9',
        name: 'Renda Ativa',
      }),
      account: expect.objectContaining({
        id: 'account-1',
        name: 'Main Account',
      }),
      transactionDate: transactionDate,
      dueDate: transactionDate,
    });
    expect(transaction.id).toBeDefined();
    expect(transaction.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a transaction with dueDate', async () => {
    const transactionRepository = new InMemoryTransactionRepository();
    const transactionItemRepository = new InMemoryTransactionItemRepository();
    const categoryRepository = new InMemoryCategoryRepository();
    const accountRepository = new InMemoryAccountRepository();
    const useCase = new CreateTransactionUseCase(
      transactionRepository as any,
      categoryRepository as any,
      accountRepository as any,
      transactionItemRepository as any,
    );

    const dueDate = new Date('2024-12-31');
    const transactionDate = new Date('2024-12-01');
    const account = await accountRepository.create({
      id: 'account-2',
      name: 'Credit Card',
      description: 'Card account',
      updatedAt: new Date(),
    });
    const transactionItem = await transactionItemRepository.create(
      new TransactionItem('test-item-2', 'Item de Contas', 'Item para pagamento', new Date()),
    );

    const payload = {
      description: 'Bill',
      amount: 200,
      type: TransactionType.EXPENSE,
      categoryId: '2', // Serviços públicos
      transactionItemId: transactionItem.id,
      accountId: account.id,
      transactionDate: transactionDate,
      dueDate: dueDate,
    };

    const transaction = await useCase.execute(payload as any);

    expect(transaction).toMatchObject({
      description: 'Bill',
      amount: 200,
      type: TransactionType.EXPENSE,
      category: expect.objectContaining({
        id: '2',
        name: 'Serviços públicos',
      }),
      account: expect.objectContaining({
        id: 'account-2',
        name: 'Credit Card',
      }),
      transactionDate: transactionDate,
      dueDate: dueDate,
    });
    expect(transaction.id).toBeDefined();
    expect(transaction.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a transaction without description', async () => {
    const transactionRepository = new InMemoryTransactionRepository();
    const transactionItemRepository = new InMemoryTransactionItemRepository();
    const categoryRepository = new InMemoryCategoryRepository();
    const accountRepository = new InMemoryAccountRepository();
    const useCase = new CreateTransactionUseCase(
      transactionRepository as any,
      categoryRepository as any,
      accountRepository as any,
      transactionItemRepository as any,
    );

    const transactionDate = new Date('2024-12-01');

    const account = await accountRepository.create({
      id: 'account-3',
      name: 'Savings Account',
      description: 'Savings account',
      updatedAt: new Date(),
    });

    const transactionItem = await transactionItemRepository.create(
      new TransactionItem('test-item-3', 'Item sem descrição', 'Item opcional', new Date()),
    );

    const payload = {
      amount: 500,
      type: TransactionType.INCOME,
      categoryId: '9', // Renda Ativa
      transactionItemId: transactionItem.id,
      accountId: account.id,
      transactionDate: transactionDate,
    };

    const transaction = await useCase.execute(payload as any);

    expect(transaction).toMatchObject({
      description: undefined,
      amount: 500,
      type: TransactionType.INCOME,
      category: expect.objectContaining({
        id: '9',
        name: 'Renda Ativa',
      }),
      account: expect.objectContaining({
        id: 'account-3',
        name: 'Savings Account',
      }),
      transactionDate: transactionDate,
      dueDate: transactionDate,
    });
    expect(transaction.id).toBeDefined();
    expect(transaction.updatedAt).toBeInstanceOf(Date);
  });
});
