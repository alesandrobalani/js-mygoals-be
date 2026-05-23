import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories } from '../../test-utils/test-datasource';
import { PostgreSQLTransactionItemRepository } from '../../infrastructure/persistence/postgresql/transaction-item.repository';
import { TransactionItemEntity } from '../../infrastructure/persistence/postgresql/transaction-item.entity';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { GetTransactionItemsUseCase } from './get-transaction-items.usecase';
import { randomUUID } from 'crypto';

describe('GetTransactionItemsUseCase', () => {
  let dataSource: DataSource;
  let transactionItemRepository: PostgreSQLTransactionItemRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    transactionItemRepository = createTestRepositories(dataSource).transactionItemRepository;
  });

  afterAll(async () => { await dataSource.destroy(); });
  beforeEach(async () => { await dataSource.getRepository(TransactionItemEntity).clear(); });

  it('should return an empty array when no transaction items exist', async () => {
    const useCase = new GetTransactionItemsUseCase(transactionItemRepository as any);

    const items = await useCase.execute();

    expect(items).toEqual([]);
  });

  it('should return all transaction items', async () => {
    const useCase = new GetTransactionItemsUseCase(transactionItemRepository as any);

    await transactionItemRepository.create(new TransactionItem(randomUUID(), 'Item 1', 'Desc 1', new Date()));
    await transactionItemRepository.create(new TransactionItem(randomUUID(), 'Item 2', 'Desc 2', new Date()));

    const items = await useCase.execute();

    expect(items).toHaveLength(2);
    expect(items.map(i => i.name)).toEqual(expect.arrayContaining(['Item 1', 'Item 2']));
  });
});
