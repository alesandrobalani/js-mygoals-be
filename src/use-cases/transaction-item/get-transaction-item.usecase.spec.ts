import { InMemoryTransactionItemRepository } from '../../infrastructure/persistence/in-memory/transaction-item.repository';
import { GetTransactionItemUseCase } from './get-transaction-item.usecase';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';

describe('GetTransactionItemUseCase', () => {
  it('should return the transaction item if it exists', async () => {
    const transactionItemRepository = new InMemoryTransactionItemRepository();
    const useCase = new GetTransactionItemUseCase(transactionItemRepository as any);

    const item = new TransactionItem('123', 'Test Item', 'Test desc', new Date());
    await transactionItemRepository.create(item);

    const result = await useCase.execute('123');

    expect(result).toEqual(item);
  });

  it('should throw an error if the transaction item does not exist', async () => {
    const transactionItemRepository = new InMemoryTransactionItemRepository();
    const useCase = new GetTransactionItemUseCase(transactionItemRepository as any);

    await expect(useCase.execute('nonexistent')).rejects.toThrow('Transaction item with ID "nonexistent" not found');
  });
});