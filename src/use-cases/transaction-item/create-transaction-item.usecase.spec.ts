import { InMemoryTransactionItemRepository } from '../../infrastructure/persistence/in-memory/transaction-item.repository';
import { CreateTransactionItemUseCase } from './create-transaction-item.usecase';

describe('CreateTransactionItemUseCase', () => {
  it('should create a transaction item', async () => {
    const transactionItemRepository = new InMemoryTransactionItemRepository();
    const useCase = new CreateTransactionItemUseCase(transactionItemRepository as any);

    const item = await useCase.execute({
      name: 'Test Item',
      description: 'Test description',
    });

    expect(item).toMatchObject({
      name: 'Test Item',
      description: 'Test description',
    });
    expect(item.id).toBeDefined();
    expect(item.updatedAt).toBeInstanceOf(Date);
  });

  it('should not allow duplicate transaction item names', async () => {
    const transactionItemRepository = new InMemoryTransactionItemRepository();
    const useCase = new CreateTransactionItemUseCase(transactionItemRepository as any);

    await useCase.execute({
      name: 'Existing Item',
      description: 'First item',
    });

    await expect(
      useCase.execute({
        name: 'Existing Item',
        description: 'Second item',
      }),
    ).rejects.toThrow('Transaction item with name "Existing Item" already exists');
  });
});