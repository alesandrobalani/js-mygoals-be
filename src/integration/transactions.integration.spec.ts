import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Transactions integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
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
        category: 'Test',
      })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      description: 'Test Income',
      amount: 100,
      type: 'income',
      category: 'Test',
    });

    const findResponse = await request(app.getHttpServer())
      .get('/transactions')
      .expect(200);

    expect(findResponse.body).toHaveLength(1);
  });
});
