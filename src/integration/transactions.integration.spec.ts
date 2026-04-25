import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestTransactionsModule } from '../modules/transactions/test-transactions.module';
import { InMemoryAccountRepository } from '../infrastructure/persistence/in-memory/account.repository';
import { InMemoryTransactionItemRepository } from '../infrastructure/persistence/in-memory/transaction-item.repository';
import { TransactionItem } from '../domain/entities/transaction-item.entity';

describe('Transactions integration', () => {
  let app: INestApplication;
  let accountRepository: InMemoryAccountRepository;
  let transactionItemRepository: InMemoryTransactionItemRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestTransactionsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    accountRepository = moduleRef.get(InMemoryAccountRepository);
    transactionItemRepository = moduleRef.get(InMemoryTransactionItemRepository);
    await app.init();
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
      new TransactionItem(
        'summary-item-1',
        'Summary Item',
        'Item para testes de resumo',
        new Date(),
      ),
    );

    const basePayload = {
      categoryId: '9',
      transactionItemId: transactionItem.id,
      accountId: account.id,
    };

    await request(app.getHttpServer())
      .post('/transactions')
      .send({ ...basePayload, description: 'Salário', amount: 3000, type: 'income', transactionDate: '2024-03-10' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/transactions')
      .send({ ...basePayload, description: 'Freelance', amount: 1000, type: 'income', transactionDate: '2024-07-20' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/transactions')
      .send({ ...basePayload, description: 'Aluguel', amount: 1200, type: 'expense', transactionDate: '2024-04-05' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/transactions')
      .send({ ...basePayload, description: 'Fora do período', amount: 9999, type: 'income', transactionDate: '2023-12-01' })
      .expect(201);

    const summaryResponse = await request(app.getHttpServer())
      .get('/transactions/summary')
      .query({ startDate: '2024-01-01', endDate: '2024-12-31' })
      .expect(200);

    expect(summaryResponse.body).toMatchObject({
      income: 4000,
      expense: 1200,
    });
  });
});
