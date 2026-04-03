import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAccountsModule } from '../../../src/modules/accounts/test-accounts.module';

describe('Accounts e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAccountsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create, update, list and delete an account', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/accounts')
      .send({
        name: 'Conta E2E',
        description: 'Conta criada em teste e2e',
      })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      name: 'Conta E2E',
      description: 'Conta criada em teste e2e',
    });
    expect(createResponse.body.id).toBeDefined();
    expect(createResponse.body.updatedAt).toBeDefined();

    const accountId = createResponse.body.id;

    const listResponse = await request(app.getHttpServer())
      .get('/accounts')
      .expect(200);

    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.some((account: any) => account.id === accountId)).toBe(true);

    const updateResponse = await request(app.getHttpServer())
      .put(`/accounts/${accountId}`)
      .send({
        name: 'Conta Atualizada E2E',
        description: 'Descrição atualizada no e2e',
      })
      .expect(200);

    expect(updateResponse.body).toMatchObject({
      id: accountId,
      name: 'Conta Atualizada E2E',
      description: 'Descrição atualizada no e2e',
    });

    await request(app.getHttpServer()).delete(`/accounts/${accountId}`).expect(200);

    const finalListResponse = await request(app.getHttpServer())
      .get('/accounts')
      .expect(200);

    expect(finalListResponse.body.some((account: any) => account.id === accountId)).toBe(false);
  });
});