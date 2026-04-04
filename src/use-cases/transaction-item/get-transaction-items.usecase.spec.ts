import { InMemoryTransactionItemRepository } from '../../infrastructure/persistence/in-memory/transaction-item.repository';
import { GetTransactionItemsUseCase } from './get-transaction-items.usecase';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';

describe('GetTransactionItemsUseCase', () => {
  it('should return an empty array when no transaction items exist', async () => {
    const transactionItemRepository = new InMemoryTransactionItemRepository();
    const useCase = new GetTransactionItemsUseCase(transactionItemRepository as any);

    const items = await useCase.execute();

    expect(items).toEqual([]);
  });

  it('should return all transaction items', async () => {
    const transactionItemRepository = new InMemoryTransactionItemRepository();
    const useCase = new GetTransactionItemsUseCase(transactionItemRepository as any);

    const item1 = new TransactionItem('1', 'Item 1', 'Desc 1', new Date());
    const item2 = new TransactionItem('2', 'Item 2', 'Desc 2', new Date());

    await transactionItemRepository.create(item1);
    await transactionItemRepository.create(item2);

    const items = await useCase.execute();

    expect(items).toHaveLength(2);
    expect(items).toEqual([item1, item2]);
  });
});