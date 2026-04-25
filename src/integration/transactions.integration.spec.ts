import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TestTransactionsModule } from '../modules/transactions/test-transactions.module';
import { InMemoryAccountRepository } from '../infrastructure/persistence/in-memory/account.repository';
import { InMemoryTransactionItemRepository } from '../infrastructure/persistence/in-memory/transaction-item.repository';
import { InMemoryTransactionRepository } from '../infrastructure/persistence/in-memory/transaction.repository';
import { TransactionItem } from '../domain/entities/transaction-item.entity';

describe('Transactions integration', () => {
  let app: INestApplication;
  let accountRepository: InMemoryAccountRepository;
  let transactionItemRepository: InMemoryTransactionItemRepository;
  let transactionRepository: InMemoryTransactionRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestTransactionsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
    accountRepository = moduleRef.get(InMemoryAccountRepository);
    transactionItemRepository = moduleRef.get(InMemoryTransactionItemRepository);
    transactionRepository = moduleRef.get(InMemoryTransactionRepository);
    await app.init();
  });

  beforeEach(() => {
    transactionRepository.clear();
    accountRepository.clear();
    transactionItemRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });


  it('should return transaction summary grouped by type for a period', async () => {
    const account = await accountRepository.create({
      id: 'summary-account-1',
      name: 'Summary Account',
      description: 'Account for summary tests',
      updatedAt: new Date(),
    });

    const transactionItem = await transactionItemRepository.create(
      new TransactionItem('summary-item-1', 'Summary Item', 'Item para testes de resumo', new Date()),
    );

    const basePayload = {
      categoryId: '9',
      transactionItemId: transactionItem.id,
      accountId: account.id,
    };

    await request(app.getHttpServer()).post('/transactions')
      .send({ ...basePayload, description: 'Salário', amount: 3000, type: 'income', transactionDate: '2024-03-10' })
      .expect(201);

    await request(app.getHttpServer()).post('/transactions')
      .send({ ...basePayload, description: 'Freelance', amount: 1000, type: 'income', transactionDate: '2024-07-20' })
      .expect(201);

    await request(app.getHttpServer()).post('/transactions')
      .send({ ...basePayload, description: 'Aluguel', amount: 1200, type: 'expense', transactionDate: '2024-04-05' })
      .expect(201);

    await request(app.getHttpServer()).post('/transactions')
      .send({ ...basePayload, description: 'Fora do período', amount: 9999, type: 'income', transactionDate: '2023-12-01' })
      .expect(201);

    const summaryResponse = await request(app.getHttpServer())
      .get('/transactions/summary')
      .query({ startDate: '2024-01-01', endDate: '2024-12-31' })
      .expect(200);

    expect(summaryResponse.body).toMatchObject({ income: 4000, expense: 1200 });
  });

  it('should search transactions by period with pagination', async () => {
    const account = await accountRepository.create({
      id: 'search-account-1',
      name: 'Search Account',
      description: 'Account for search tests',
      updatedAt: new Date(),
    });

    const transactionItem = await transactionItemRepository.create(
      new TransactionItem('search-item-1', 'Search Item', 'Item para testes de busca', new Date()),
    );

    const basePayload = {
      categoryId: '9',
      transactionItemId: transactionItem.id,
      accountId: account.id,
    };

    for (let month = 1; month <= 5; month++) {
      const paddedMonth = String(month).padStart(2, '0');
      await request(app.getHttpServer()).post('/transactions')
        .send({ ...basePayload, description: `Tx ${month}`, amount: month * 100, type: 'income', transactionDate: `2024-${paddedMonth}-15` })
        .expect(201);
    }

    await request(app.getHttpServer()).post('/transactions')
      .send({ ...basePayload, description: 'Fora do período', amount: 9999, type: 'expense', transactionDate: '2023-06-01' })
      .expect(201);

    const page1 = await request(app.getHttpServer())
      .get('/transactions/search')
      .query({ startDate: '2024-01-01', endDate: '2024-12-31', page: 1, limit: 3 })
      .expect(200);

    expect(page1.body.total).toBe(5);
    expect(page1.body.data).toHaveLength(3);
    expect(page1.body.page).toBe(1);
    expect(page1.body.totalPages).toBe(2);
    expect(page1.body.limit).toBe(3);

    const page2 = await request(app.getHttpServer())
      .get('/transactions/search')
      .query({ startDate: '2024-01-01', endDate: '2024-12-31', page: 2, limit: 3 })
      .expect(200);

    expect(page2.body.data).toHaveLength(2);
    expect(page2.body.page).toBe(2);
  });
});
