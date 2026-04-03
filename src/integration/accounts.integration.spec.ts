import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAccountsModule } from '../modules/accounts/test-accounts.module';
import { InMemoryTransactionRepository } from '../infrastructure/persistence/in-memory/transaction.repository';
import { Transaction } from '../domain/entities/transaction.entity';
import { Category } from '../domain/entities/category.entity';
import { Account } from '../domain/entities/account.entity';
import { TransactionType } from '../dto/create-transaction.dto';
import { randomUUID } from 'crypto';

describe('Accounts integration', () => {
  let app: INestApplication;
  let transactionRepository: InMemoryTransactionRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAccountsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    transactionRepository = moduleRef.get(InMemoryTransactionRepository);
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
        description: 'Conta criada em teste de integração',
      })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      name: 'Conta E2E',
      description: 'Conta criada em teste de integração',
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
        name: 'Conta Atualizada',
        description: 'Descrição atualizada',
      })
      .expect(200);

    expect(updateResponse.body).toMatchObject({
      id: accountId,
      name: 'Conta Atualizada',
      description: 'Descrição atualizada',
    });

    await request(app.getHttpServer()).delete(`/accounts/${accountId}`).expect(200);

    const finalListResponse = await request(app.getHttpServer())
      .get('/accounts')
      .expect(200);

    expect(finalListResponse.body.some((account: any) => account.id === accountId)).toBe(false);
  });

  it('should not allow deleting an account with associated transactions', async () => {
    // Create account
    const createResponse = await request(app.getHttpServer())
      .post('/accounts')
      .send({
        name: 'Conta Com Transação',
        description: 'Conta que terá uma transação associada',
      })
      .expect(201);

    const accountId = createResponse.body.id;
    const account = new Account(accountId, 'Conta Com Transação', 'Conta que terá uma transação associada', new Date());

    // Create a transaction associated with this account
    const category = new Category('5', 'Alimentação', 'Compras de supermercado, restaurantes', new Date());
    const transaction = new Transaction(
      randomUUID(),
      'Transação de teste',
      100,
      TransactionType.EXPENSE,
      category,
      new Date(),
      account,
      new Date(),
      new Date(),
    );

    await transactionRepository.create(transaction);

    // Try to delete the account - should fail
    const deleteResponse = await request(app.getHttpServer())
      .delete(`/accounts/${accountId}`)
      .expect(400); // Bad request due to business rule violation

    expect(deleteResponse.body.message).toContain('Cannot delete account');
    expect(deleteResponse.body.message).toContain('associated transaction');
  });
});
