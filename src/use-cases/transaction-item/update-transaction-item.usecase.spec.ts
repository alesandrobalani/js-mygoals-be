import { InMemoryTransactionItemRepository } from '../../infrastructure/persistence/in-memory/transaction-item.repository';
import { UpdateTransactionItemUseCase } from './update-transaction-item.usecase';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';

describe('UpdateTransactionItemUseCase', () => {
  it('should update a transaction item', async () => {
    const transactionItemRepository = new InMemoryTransactionItemRepository();
    const useCase = new UpdateTransactionItemUseCase(transactionItemRepository as any);

    const item = new TransactionItem('123', 'Original Name', 'Original desc', new Date());
    await transactionItemRepository.create(item);

    const updated = await useCase.execute('123', {
      name: 'Updated Name',
      description: 'Updated desc',
    });

    expect(updated.name).toBe('Updated Name');
    expect(updated.description).toBe('Updated desc');
    expect(updated.id).toBe('123');
    expect(updated.updatedAt).toBeInstanceOf(Date);
  });

  it('should throw an error if the transaction item does not exist', async () => {
    const transactionItemRepository = new InMemoryTransactionItemRepository();
    const useCase = new UpdateTransactionItemUseCase(transactionItemRepository as any);

    await expect(useCase.execute('nonexistent', { name: 'New Name' })).rejects.toThrow('Transaction item with ID "nonexistent" not found');
  });

  it('should throw an error if updating to a duplicate name', async () => {
    const transactionItemRepository = new InMemoryTransactionItemRepository();
    const useCase = new UpdateTransactionItemUseCase(transactionItemRepository as any);

    const item1 = new TransactionItem('1', 'Item 1', 'Desc 1', new Date());
    const item2 = new TransactionItem('2', 'Item 2', 'Desc 2', new Date());
    await transactionItemRepository.create(item1);
    await transactionItemRepository.create(item2);

    await expect(useCase.execute('1', { name: 'Item 2' })).rejects.toThrow('Transaction item with name "Item 2" already exists');
  });

  it('should allow updating description without changing name', async () => {
    const transactionItemRepository = new InMemoryTransactionItemRepository();
    const useCase = new UpdateTransactionItemUseCase(transactionItemRepository as any);

    const item = new TransactionItem('123', 'Name', 'Old desc', new Date());
    await transactionItemRepository.create(item);

    const updated = await useCase.execute('123', { description: 'New desc' });

    expect(updated.name).toBe('Name');
    expect(updated.description).toBe('New desc');
  });
});