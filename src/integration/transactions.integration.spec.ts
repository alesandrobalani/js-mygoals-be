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

  it('should create and retrieve transactions', async () => {
    const account = await accountRepository.create({
      id: 'test-account-1',
      name: 'Test Account',
      description: 'Account used for transaction tests',
      updatedAt: new Date(),
    });

    const transactionItem = await transactionItemRepository.create(
      new TransactionItem(
        'test-transaction-item-1',
        'Item de Teste',
        'Item usado em testes de transação',
        new Date(),
      ),
    );

    const createResponse = await request(app.getHttpServer())
      .post('/transactions')
      .send({
        description: 'Test Income',
        amount: 100,
        type: 'income',
        categoryId: '9',
        transactionItemId: transactionItem.id,
        accountId: account.id,
        transactionDate: new Date().toISOString(),
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
      account: {
        id: 'test-account-1',
        name: 'Test Account',
      },
    });

    const findResponse = await request(app.getHttpServer())
      .get('/transactions')
      .expect(200);

    expect(findResponse.body).toHaveLength(1);
  });
});
