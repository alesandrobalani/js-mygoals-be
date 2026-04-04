import { InMemoryTransactionItemRepository } from '../../infrastructure/persistence/in-memory/transaction-item.repository';
import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';
import { DeleteTransactionItemUseCase } from './delete-transaction-item.usecase';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Account } from '../../domain/entities/account.entity';
import { Category } from '../../domain/entities/category.entity';
import { TransactionType } from '../../dto/create-transaction.dto';

describe('DeleteTransactionItemUseCase', () => {
  it('should delete a transaction item if no transactions are using it', async () => {
    const transactionItemRepository = new InMemoryTransactionItemRepository();
    const transactionRepository = new InMemoryTransactionRepository();
    const useCase = new DeleteTransactionItemUseCase(
      transactionItemRepository as any,
      transactionRepository as any,
    );

    const item = new TransactionItem('123', 'Test Item', 'Desc', new Date());
    await transactionItemRepository.create(item);

    await expect(useCase.execute('123')).resolves.toBeUndefined();

    const found = await transactionItemRepository.findById('123');
    expect(found).toBeNull();
  });

  it('should throw an error if the transaction item is used by transactions', async () => {
    const transactionItemRepository = new InMemoryTransactionItemRepository();
    const transactionRepository = new InMemoryTransactionRepository();
    const useCase = new DeleteTransactionItemUseCase(
      transactionItemRepository as any,
      transactionRepository as any,
    );

    const item = new TransactionItem('123', 'Test Item', 'Desc', new Date());
    await transactionItemRepository.create(item);

    // Create a transaction using this item
    const account = new Account('acc1', 'Account', 'Desc', new Date());
    const category = new Category('cat1', 'Category', 'Desc', new Date());
    const transaction = new Transaction(
      'tx1',
      'Transaction desc',
      100,
      TransactionType.INCOME,
      category,
      item,
      new Date(),
      account,
      new Date(),
      new Date(),
    );
    await transactionRepository.create(transaction);

    await expect(useCase.execute('123')).rejects.toThrow('Cannot delete transaction item because it is used by one or more transactions');
  });

  it('should throw an error if the transaction item does not exist', async () => {
    const transactionItemRepository = new InMemoryTransactionItemRepository();
    const transactionRepository = new InMemoryTransactionRepository();
    const useCase = new DeleteTransactionItemUseCase(
      transactionItemRepository as any,
      transactionRepository as any,
    );

    await expect(useCase.execute('nonexistent')).rejects.toThrow(); // The repository will throw, but in this case, since in-memory throws in delete if not found
  });
});