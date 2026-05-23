import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories } from '../../test-utils/test-datasource';
import { PostgreSQLTransactionItemRepository } from '../../infrastructure/persistence/postgresql/transaction-item.repository';
import { TransactionItemEntity } from '../../infrastructure/persistence/postgresql/transaction-item.entity';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { GetTransactionItemUseCase } from './get-transaction-item.usecase';
import { randomUUID } from 'crypto';

describe('GetTransactionItemUseCase', () => {
  let dataSource: DataSource;
  let transactionItemRepository: PostgreSQLTransactionItemRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    transactionItemRepository = createTestRepositories(dataSource).transactionItemRepository;
  });

  afterAll(async () => { await dataSource.destroy(); });
  beforeEach(async () => { await dataSource.getRepository(TransactionItemEntity).clear(); });

  it('should return the transaction item if it exists', async () => {
    const useCase = new GetTransactionItemUseCase(transactionItemRepository as any);

    const item = new TransactionItem(randomUUID(), 'Test Item', 'Test desc', new Date());
    await transactionItemRepository.create(item);

    const result = await useCase.execute(item.id);

    expect(result).toMatchObject({ id: item.id, name: 'Test Item', description: 'Test desc' });
  });

  it('should throw an error if the transaction item does not exist', async () => {
    const useCase = new GetTransactionItemUseCase(transactionItemRepository as any);

    await expect(useCase.execute('nonexistent')).rejects.toThrow('Transaction item with ID "nonexistent" not found');
  });
});
