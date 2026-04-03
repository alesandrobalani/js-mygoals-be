import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';
import { InMemoryCategoryRepository } from '../../infrastructure/persistence/in-memory/category.repository';
import { CreateTransactionUseCase } from './create-transaction.usecase';
import { TransactionType } from '../../dto/create-transaction.dto';
import { Category } from '../../domain/entities/category.entity';

describe('CreateTransactionUseCase', () => {
  it('should create a transaction', async () => {
    const transactionRepository = new InMemoryTransactionRepository();
    const categoryRepository = new InMemoryCategoryRepository();
    const useCase = new CreateTransactionUseCase(transactionRepository as any, categoryRepository as any);

    const transactionDate = new Date('2024-12-01');

    const payload = {
      description: 'Salary',
      amount: 1000,
      type: TransactionType.INCOME,
      categoryId: '9', // Renda Ativa
      transactionDate: transactionDate,
      account: 'Main Account',
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
      account: 'Main Account',
      transactionDate: transactionDate,
      dueDate: transactionDate,
    });
    expect(transaction.id).toBeDefined();
    expect(transaction.createdAt).toBeInstanceOf(Date);
  });

  it('should create a transaction with dueDate', async () => {
    const transactionRepository = new InMemoryTransactionRepository();
    const categoryRepository = new InMemoryCategoryRepository();
    const useCase = new CreateTransactionUseCase(transactionRepository as any, categoryRepository as any);

    const dueDate = new Date('2024-12-31');
    const transactionDate = new Date('2024-12-01');
    const payload = {
      description: 'Bill',
      amount: 200,
      type: TransactionType.EXPENSE,
      categoryId: '2', // Serviços públicos
      transactionDate: transactionDate,
      dueDate: dueDate,
      account: 'Credit Card',
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
      account: 'Credit Card',
      transactionDate: transactionDate,
      dueDate: dueDate,
    });
    expect(transaction.id).toBeDefined();
    expect(transaction.createdAt).toBeInstanceOf(Date);
  });
});
