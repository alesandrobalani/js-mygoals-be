import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { TestAccountsModule } from '../modules/accounts/test-accounts.module';
import { TransactionRepository } from '../domain/repositories/transaction.repository';
import { TransactionItemRepository } from '../domain/repositories/transaction-item.repository';
import { Transaction } from '../domain/entities/transaction.entity';
import { TransactionItem } from '../domain/entities/transaction-item.entity';
import { Category } from '../domain/entities/category.entity';
import { Account } from '../domain/entities/account.entity';
import { TransactionType } from '../dto/create-transaction.dto';
import { TransactionEntity } from '../infrastructure/persistence/postgresql/transaction.entity';
import { AccountEntity } from '../infrastructure/persistence/postgresql/account.entity';
import { TransactionItemEntity } from '../infrastructure/persistence/postgresql/transaction-item.entity';
import { randomUUID } from 'crypto';
import { seedTestCategories } from '../test-utils/test-datasource';

describe('Accounts integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let transactionRepository: TransactionRepository;
  let transactionItemRepository: TransactionItemRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAccountsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    dataSource = moduleRef.get(DataSource, { strict: false });
    transactionRepository = moduleRef.get<TransactionRepository>('TransactionRepository');
    transactionItemRepository = moduleRef.get<TransactionItemRepository>('TransactionItemRepository');
    await app.init();
    await seedTestCategories(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.getRepository(TransactionEntity).clear();
    await dataSource.getRepository(AccountEntity).clear();
    await dataSource.getRepository(TransactionItemEntity).clear();
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
    const createResponse = await request(app.getHttpServer())
      .post('/accounts')
      .send({
        name: 'Conta Com Transação',
        description: 'Conta que terá uma transação associada',
      })
      .expect(201);

    const accountId = createResponse.body.id;
    const txItem = await transactionItemRepository.create(
      new TransactionItem(randomUUID(), 'Item Obrigatório', 'Item usado em teste de conta', new Date()),
    );

    await transactionRepository.create(new Transaction(
      randomUUID(),
      'Transação de teste',
      100,
      TransactionType.EXPENSE,
      new Category('5', 'Alimentação', 'Compras de supermercado, restaurantes', new Date()),
      txItem,
      new Date(),
      new Account(accountId, 'Conta Com Transação', 'Conta que terá uma transação associada', new Date()),
      new Date(),
      new Date(),
      true,
    ));

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/accounts/${accountId}`)
      .expect(400);

    expect(deleteResponse.body.message).toContain('Cannot delete account');
    expect(deleteResponse.body.message).toContain('associated transaction');
  });
});
