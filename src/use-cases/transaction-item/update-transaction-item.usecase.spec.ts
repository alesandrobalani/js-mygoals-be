import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories } from '../../test-utils/test-datasource';
import { PostgreSQLTransactionItemRepository } from '../../infrastructure/persistence/postgresql/transaction-item.repository';
import { TransactionItemEntity } from '../../infrastructure/persistence/postgresql/transaction-item.entity';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { UpdateTransactionItemUseCase } from './update-transaction-item.usecase';
import { randomUUID } from 'crypto';

describe('UpdateTransactionItemUseCase', () => {
  let dataSource: DataSource;
  let transactionItemRepository: PostgreSQLTransactionItemRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    transactionItemRepository = createTestRepositories(dataSource).transactionItemRepository;
  });

  afterAll(async () => { await dataSource.destroy(); });
  beforeEach(async () => { await dataSource.getRepository(TransactionItemEntity).clear(); });

  it('should update a transaction item', async () => {
    const useCase = new UpdateTransactionItemUseCase(transactionItemRepository as any);

    const item = await transactionItemRepository.create(new TransactionItem(randomUUID(), 'Original Name', 'Original desc', new Date()));

    const updated = await useCase.execute(item.id, { name: 'Updated Name', description: 'Updated desc' });

    expect(updated.name).toBe('Updated Name');
    expect(updated.description).toBe('Updated desc');
    expect(updated.id).toBe(item.id);
    expect(updated.updatedAt).toBeInstanceOf(Date);
  });

  it('should throw an error if the transaction item does not exist', async () => {
    const useCase = new UpdateTransactionItemUseCase(transactionItemRepository as any);

    await expect(useCase.execute('nonexistent', { name: 'New Name' })).rejects.toThrow('Transaction item with ID "nonexistent" not found');
  });

  it('should throw an error if updating to a duplicate name', async () => {
    const useCase = new UpdateTransactionItemUseCase(transactionItemRepository as any);

    const id1 = randomUUID();
    const id2 = randomUUID();
    await transactionItemRepository.create(new TransactionItem(id1, 'Item 1', 'Desc 1', new Date()));
    await transactionItemRepository.create(new TransactionItem(id2, 'Item 2', 'Desc 2', new Date()));

    await expect(useCase.execute(id1, { name: 'Item 2' })).rejects.toThrow('Transaction item with name "Item 2" already exists');
  });

  it('should allow updating description without changing name', async () => {
    const useCase = new UpdateTransactionItemUseCase(transactionItemRepository as any);

    const item = await transactionItemRepository.create(new TransactionItem(randomUUID(), 'Name', 'Old desc', new Date()));

    const updated = await useCase.execute(item.id, { description: 'New desc' });

    expect(updated.name).toBe('Name');
    expect(updated.description).toBe('New desc');
  });
});
