import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TestTransactionItemsModule } from '../modules/transaction-items/test-transaction-items.module';
import { InMemoryTransactionRepository } from '../infrastructure/persistence/in-memory/transaction.repository';
import { Transaction } from '../domain/entities/transaction.entity';
import { Account } from '../domain/entities/account.entity';
import { Category } from '../domain/entities/category.entity';
import { TransactionItem } from '../domain/entities/transaction-item.entity';
import { TransactionType } from '../dto/create-transaction.dto';
import { randomUUID } from 'crypto';

describe('TransactionItems integration', () => {
  let app: INestApplication;
  let transactionRepository: InMemoryTransactionRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestTransactionItemsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    transactionRepository = moduleRef.get(InMemoryTransactionRepository);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create, list, retrieve, update and delete a transaction item', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/transaction-items')
      .send({ name: 'Item de Teste', description: 'Descrição do item' })
      .expect(201);

    expect(createResponse.body).toMatchObject({ name: 'Item de Teste', description: 'Descrição do item' });
    expect(createResponse.body.id).toBeDefined();

    const itemId = createResponse.body.id;

    const listResponse = await request(app.getHttpServer()).get('/transaction-items').expect(200);
    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.some((item: any) => item.id === itemId)).toBe(true);

    const getOneResponse = await request(app.getHttpServer()).get(`/transaction-items/${itemId}`).expect(200);
    expect(getOneResponse.body.id).toBe(itemId);

    const updateResponse = await request(app.getHttpServer())
      .put(`/transaction-items/${itemId}`)
      .send({ name: 'Item Atualizado' })
      .expect(200);

    expect(updateResponse.body).toMatchObject({ id: itemId, name: 'Item Atualizado' });

    await request(app.getHttpServer()).delete(`/transaction-items/${itemId}`).expect(200);

    const finalList = await request(app.getHttpServer()).get('/transaction-items').expect(200);
    expect(finalList.body.some((item: any) => item.id === itemId)).toBe(false);
  });

  it('should not allow deleting a transaction item used by transactions', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/transaction-items')
      .send({ name: 'Item Com Transação' })
      .expect(201);

    const itemId = createResponse.body.id;
    const item = new TransactionItem(itemId, 'Item Com Transação', undefined, new Date());
    const account = new Account('acc1', 'Conta', undefined, new Date());
    const category = new Category('1', 'Categoria', undefined, new Date());

    await transactionRepository.create(new Transaction(
      randomUUID(), 'tx', 100, TransactionType.EXPENSE,
      category, item, new Date(), account, new Date(), new Date(), true
    ));

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/transaction-items/${itemId}`)
      .expect(400);

    expect(deleteResponse.body.message).toContain('Cannot delete transaction item');
  });

  it('should return 400 for invalid UUID parameter', async () => {
    await request(app.getHttpServer()).get('/transaction-items/not-a-uuid').expect(400);
  });

  it('should return 409 when creating a duplicate transaction item', async () => {
    await request(app.getHttpServer())
      .post('/transaction-items')
      .send({ name: 'Item Duplicado' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/transaction-items')
      .send({ name: 'Item Duplicado' })
      .expect(409);
  });
});
