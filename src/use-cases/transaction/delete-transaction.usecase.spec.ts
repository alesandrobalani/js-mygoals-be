import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories, seedTestCategories } from '../../test-utils/test-datasource';
import { PostgreSQLTransactionRepository } from '../../infrastructure/persistence/postgresql/transaction.repository';
import { PostgreSQLTransactionItemRepository } from '../../infrastructure/persistence/postgresql/transaction-item.repository';
import { PostgreSQLAccountRepository } from '../../infrastructure/persistence/postgresql/account.repository';
import { TransactionEntity } from '../../infrastructure/persistence/postgresql/transaction.entity';
import { AccountEntity } from '../../infrastructure/persistence/postgresql/account.entity';
import { TransactionItemEntity } from '../../infrastructure/persistence/postgresql/transaction-item.entity';
import { CreateTransactionUseCase } from './create-transaction.usecase';
import { DeleteTransactionUseCase } from './delete-transaction.usecase';
import { TransactionType } from '../../dto/create-transaction.dto';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { randomUUID } from 'crypto';

describe('DeleteTransactionUseCase', () => {
  let dataSource: DataSource;
  let transactionRepository: PostgreSQLTransactionRepository;
  let transactionItemRepository: PostgreSQLTransactionItemRepository;
  let accountRepository: PostgreSQLAccountRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    const repos = createTestRepositories(dataSource);
    transactionRepository = repos.transactionRepository;
    transactionItemRepository = repos.transactionItemRepository;
    accountRepository = repos.accountRepository;
    await seedTestCategories(dataSource);
  });

  afterAll(async () => { await dataSource.destroy(); });

  beforeEach(async () => {
    await dataSource.getRepository(TransactionEntity).clear();
    await dataSource.getRepository(AccountEntity).clear();
    await dataSource.getRepository(TransactionItemEntity).clear();
  });

  const makeDeleteUseCase = () => new DeleteTransactionUseCase(transactionRepository as any);

  it('deve remover a transação existente', async () => {
    const account = await accountRepository.create({ id: randomUUID(), name: 'Conta Teste', description: undefined, updatedAt: new Date() });
    const item = await transactionItemRepository.create(new TransactionItem(randomUUID(), 'Item Teste', undefined, new Date()));

    const createUseCase = new CreateTransactionUseCase(
      transactionRepository as any,
      createTestRepositories(dataSource).categoryRepository as any,
      accountRepository as any,
      transactionItemRepository as any,
    );

    const created = await createUseCase.execute({
      description: 'Aluguel',
      amount: 1200,
      type: TransactionType.EXPENSE,
      categoryId: '1',
      transactionItemId: item.id,
      accountId: account.id,
      transactionDate: new Date('2024-05-10'),
      settled: true,
    });

    await makeDeleteUseCase().execute(created.id);

    const found = await transactionRepository.findById(created.id);
    expect(found).toBeNull();
  });

  it('deve lançar NotFoundException para id inexistente', async () => {
    await expect(makeDeleteUseCase().execute(randomUUID())).rejects.toThrow(NotFoundException);
  });
});
