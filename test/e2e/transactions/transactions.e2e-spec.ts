import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestTransactionsModule } from '../../../src/modules/transactions/test-transactions.module';

describe('Transactions e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestTransactionsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/transactions (POST) then (GET)', async () => {
    // First create an account
    const accountResponse = await request(app.getHttpServer())
      .post('/accounts')
      .send({
        name: 'E2E Account',
        description: 'Account for e2e transaction test',
      })
      .expect(201);

    const accountId = accountResponse.body.id;

    await request(app.getHttpServer())
      .post('/transactions')
      .send({
        description: 'E2E Test',
        amount: 50,
        type: 'expense',
        categoryId: '5',
        accountId: accountId,
        transactionDate: new Date().toISOString(),
      })
      .expect(201);

    const response = await request(app.getHttpServer()).get('/transactions').expect(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[response.body.length - 1]).toMatchObject({
      description: 'E2E Test',
      amount: 50,
      type: 'expense',
      category: {
        id: '5',
        name: 'Alimentação',
      },
      account: {
        id: accountId,
        name: 'E2E Account',
      },
    });
  });
});
