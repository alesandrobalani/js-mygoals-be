import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';
import { CreateTransactionUseCase } from './create-transaction.usecase';
import { TransactionType } from '../../dto/create-transaction.dto';

describe('CreateTransactionUseCase', () => {
  it('should create a transaction', async () => {
    const repository = new InMemoryTransactionRepository();
    const useCase = new CreateTransactionUseCase(repository as any);

    const payload = {
      description: 'Salary',
      amount: 1000,
      type: TransactionType.INCOME,
      category: 'Work',
    };

    const transaction = await useCase.execute(payload as any);

    expect(transaction).toMatchObject({
      description: 'Salary',
      amount: 1000,
      type: TransactionType.INCOME,
      category: 'Work',
    });
    expect(transaction.id).toBeDefined();
    expect(transaction.createdAt).toBeInstanceOf(Date);
  });
});
