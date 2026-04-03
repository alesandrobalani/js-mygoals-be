import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestTransactionsModule } from '../src/modules/transactions/test-transactions.module';

describe('App e2e', () => {
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
    await request(app.getHttpServer())
      .post('/transactions')
      .send({
        description: 'E2E Test',
        amount: 50,
        type: 'expense',
        category: 'Alimentação',
        transactionDate: new Date().toISOString(),
        account: 'E2E Account',
      })
      .expect(201);

    const response = await request(app.getHttpServer()).get('/transactions').expect(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });
});
