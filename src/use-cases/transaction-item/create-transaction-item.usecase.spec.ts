import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories } from '../../test-utils/test-datasource';
import { PostgreSQLTransactionItemRepository } from '../../infrastructure/persistence/postgresql/transaction-item.repository';
import { TransactionItemEntity } from '../../infrastructure/persistence/postgresql/transaction-item.entity';
import { CreateTransactionItemUseCase } from './create-transaction-item.usecase';

describe('CreateTransactionItemUseCase', () => {
  let dataSource: DataSource;
  let transactionItemRepository: PostgreSQLTransactionItemRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    transactionItemRepository = createTestRepositories(dataSource).transactionItemRepository;
  });

  afterAll(async () => { await dataSource.destroy(); });
  beforeEach(async () => { await dataSource.getRepository(TransactionItemEntity).clear(); });

  it('should create a transaction item', async () => {
    const useCase = new CreateTransactionItemUseCase(transactionItemRepository as any);

    const item = await useCase.execute({ name: 'Test Item', description: 'Test description' });

    expect(item).toMatchObject({ name: 'Test Item', description: 'Test description' });
    expect(item.id).toBeDefined();
    expect(item.updatedAt).toBeInstanceOf(Date);
  });

  it('should not allow duplicate transaction item names', async () => {
    const useCase = new CreateTransactionItemUseCase(transactionItemRepository as any);

    await useCase.execute({ name: 'Existing Item', description: 'First item' });

    await expect(
      useCase.execute({ name: 'Existing Item', description: 'Second item' }),
    ).rejects.toThrow('Transaction item with name "Existing Item" already exists');
  });
});
