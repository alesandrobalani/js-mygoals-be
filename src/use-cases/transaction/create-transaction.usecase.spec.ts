import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';
import { CreateTransactionUseCase } from './create-transaction.usecase';
import { TransactionType, TransactionCategory } from '../../dto/create-transaction.dto';

describe('CreateTransactionUseCase', () => {
  it('should create a transaction', async () => {
    const repository = new InMemoryTransactionRepository();
    const useCase = new CreateTransactionUseCase(repository as any);

    const transactionDate = new Date('2024-12-01');

    const payload = {
      description: 'Salary',
      amount: 1000,
      type: TransactionType.INCOME,
      category: TransactionCategory.RENDA_ATIVA,
      transactionDate: transactionDate,
      account: 'Main Account',
    };

    const transaction = await useCase.execute(payload as any);

    expect(transaction).toMatchObject({
      description: 'Salary',
      amount: 1000,
      type: TransactionType.INCOME,
      category: TransactionCategory.RENDA_ATIVA,
      account: 'Main Account',
      transactionDate: transactionDate,
      dueDate: transactionDate,
    });
    expect(transaction.id).toBeDefined();
    expect(transaction.createdAt).toBeInstanceOf(Date);
  });

  it('should create a transaction with dueDate', async () => {
    const repository = new InMemoryTransactionRepository();
    const useCase = new CreateTransactionUseCase(repository as any);

    const dueDate = new Date('2024-12-31');
    const transactionDate = new Date('2024-12-01');
    const payload = {
      description: 'Bill',
      amount: 200,
      type: TransactionType.EXPENSE,
      category: TransactionCategory.SERVICOS_PUBLICOS,
      transactionDate: transactionDate,
      dueDate: dueDate,
      account: 'Credit Card',
    };

    const transaction = await useCase.execute(payload as any);

    expect(transaction).toMatchObject({
      description: 'Bill',
      amount: 200,
      type: TransactionType.EXPENSE,
      category: TransactionCategory.SERVICOS_PUBLICOS,
      account: 'Credit Card',
      transactionDate: transactionDate,
      dueDate: dueDate,
    });
    expect(transaction.id).toBeDefined();
    expect(transaction.createdAt).toBeInstanceOf(Date);
  });
});
