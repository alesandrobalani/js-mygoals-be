import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';
import { CreateTransactionUseCase } from './create-transaction.usecase';
import { TransactionType, TransactionCategory } from '../../dto/create-transaction.dto';

describe('CreateTransactionUseCase', () => {
  it('should create a transaction', async () => {
    const repository = new InMemoryTransactionRepository();
    const useCase = new CreateTransactionUseCase(repository as any);

    const payload = {
      description: 'Salary',
      amount: 1000,
      type: TransactionType.INCOME,
      category: TransactionCategory.RENDA_ATIVA,
      transactionDate: new Date(),
      account: 'Main Account',
    };

    const transaction = await useCase.execute(payload as any);

    expect(transaction).toMatchObject({
      description: 'Salary',
      amount: 1000,
      type: TransactionType.INCOME,
      category: TransactionCategory.RENDA_ATIVA,
      account: 'Main Account',
    });
    expect(transaction.id).toBeDefined();
    expect(transaction.transactionDate).toBeInstanceOf(Date);
    expect(transaction.createdAt).toBeInstanceOf(Date);
  });
});
