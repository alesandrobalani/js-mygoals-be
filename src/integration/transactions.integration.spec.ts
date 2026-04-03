import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestTransactionsModule } from '../modules/transactions/test-transactions.module';

describe('Transactions integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestTransactionsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create and retrieve transactions', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/transactions')
      .send({
        description: 'Test Income',
        amount: 100,
        type: 'income',
        categoryId: '9',
        transactionDate: new Date().toISOString(),
        account: 'Test Account',
      })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      description: 'Test Income',
      amount: 100,
      type: 'income',
      category: {
        id: '9',
        name: 'Renda Ativa',
        description: 'Salário, trabalho principal',
      },
      account: 'Test Account',
    });

    const findResponse = await request(app.getHttpServer())
      .get('/transactions')
      .expect(200);

    expect(findResponse.body).toHaveLength(1);
  });
});
