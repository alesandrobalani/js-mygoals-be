import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { TestTransactionItemsModule } from '../modules/transaction-items/test-transaction-items.module';
import { TransactionRepository } from '../domain/repositories/transaction.repository';
import { AccountRepository } from '../domain/repositories/account.repository';
import { Transaction } from '../domain/entities/transaction.entity';
import { Account } from '../domain/entities/account.entity';
import { Category } from '../domain/entities/category.entity';
import { TransactionItem } from '../domain/entities/transaction-item.entity';
import { TransactionType } from '../dto/create-transaction.dto';
import { TransactionEntity } from '../infrastructure/persistence/postgresql/transaction.entity';
import { AccountEntity } from '../infrastructure/persistence/postgresql/account.entity';
import { TransactionItemEntity } from '../infrastructure/persistence/postgresql/transaction-item.entity';
import { randomUUID } from 'crypto';
import { seedTestCategories } from '../test-utils/test-datasource';

describe('TransactionItems integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let transactionRepository: TransactionRepository;
  let accountRepository: AccountRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestTransactionItemsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    dataSource = moduleRef.get(DataSource, { strict: false });
    transactionRepository = moduleRef.get<TransactionRepository>('TransactionRepository');
    accountRepository = moduleRef.get<AccountRepository>('AccountRepository');
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

    const account = await accountRepository.create(
      new Account(randomUUID(), 'Conta Auxiliar', undefined, new Date()),
    );

    await transactionRepository.create(new Transaction(
      randomUUID(), 'tx', 100, TransactionType.EXPENSE,
      new Category('1', 'Habitação', 'Despesas relacionadas à moradia', new Date()),
      item, new Date(), account, new Date(), new Date(), true,
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
