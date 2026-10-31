import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { TestTransactionsModule } from '../modules/transactions/test-transactions.module';
import { AccountRepository } from '../domain/repositories/account.repository';
import { TransactionItemRepository } from '../domain/repositories/transaction-item.repository';
import { TransactionItem } from '../domain/entities/transaction-item.entity';
import { TransactionEntity } from '../infrastructure/persistence/postgresql/transaction.entity';
import { AccountEntity } from '../infrastructure/persistence/postgresql/account.entity';
import { TransactionItemEntity } from '../infrastructure/persistence/postgresql/transaction-item.entity';
import { seedTestCategories } from '../test-utils/test-datasource';
import { TransactionRepository } from '../domain/repositories/transaction.repository';
import { CategoryRepository } from '../domain/repositories/category.repository';
import { Transaction } from '../domain/entities/transaction.entity';
import { TransactionType } from '../dto/create-transaction.dto';
import { fromDateOnly } from '../utils/date-only';

describe('POST /transactions/copy (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accountRepository: AccountRepository;
  let transactionItemRepository: TransactionItemRepository;
  let transactionRepository: TransactionRepository;
  let categoryRepository: CategoryRepository;
  let accountId: string;
  let itemId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [TestTransactionsModule] }).compile();

    app = moduleRef.createNestApplication();
    // Mesma configuração do main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }));
    dataSource = moduleRef.get(DataSource, { strict: false });
    accountRepository = moduleRef.get<AccountRepository>('AccountRepository');
    transactionItemRepository = moduleRef.get<TransactionItemRepository>('TransactionItemRepository');
    transactionRepository = moduleRef.get<TransactionRepository>('TransactionRepository');
    categoryRepository = moduleRef.get<CategoryRepository>('CategoryRepository');
    await app.init();
    await seedTestCategories(dataSource);
  });

  beforeEach(async () => {
    await dataSource.getRepository(TransactionEntity).clear();
    await dataSource.getRepository(AccountEntity).clear();
    await dataSource.getRepository(TransactionItemEntity).clear();
    const account = await accountRepository.create({ id: randomUUID(), name: 'Conta', description: undefined, updatedAt: new Date() });
    const item = await transactionItemRepository.create(new TransactionItem(randomUUID(), 'Item', undefined, new Date()));
    accountId = account.id;
    itemId = item.id;
  });

  afterAll(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());

  // Semeia direto pelo repositório com datas em meia-noite local, para não depender do fuso do processo.
  const createTransaction = async (): Promise<string> => {
    const account = { id: accountId, name: 'Conta', description: undefined, updatedAt: new Date() };
    const item = new TransactionItem(itemId, 'Item', undefined, new Date());
    const category = (await categoryRepository.findById('1'))!;
    const created = await transactionRepository.create(new Transaction(
      randomUUID(), 'Aluguel', 1200, TransactionType.EXPENSE, category, item,
      fromDateOnly('2027-01-25'), account, new Date(), fromDateOnly('2027-01-31'), true,
    ));
    return created.id;
  };

  const countTransactions = () => dataSource.getRepository(TransactionEntity).count();

  describe('validação do DTO', () => {
    const valid = () => ({ transactionIds: [randomUUID()], targetMonths: ['2027-02'] });

    it.each([
      ['transactionIds ausente', { targetMonths: ['2027-02'] }],
      ['targetMonths ausente', { transactionIds: [randomUUID()] }],
      ['transactionIds vazio', { transactionIds: [], targetMonths: ['2027-02'] }],
      ['targetMonths vazio', { transactionIds: [randomUUID()], targetMonths: [] }],
      ['transactionIds acima de 500', { transactionIds: Array.from({ length: 501 }, () => randomUUID()), targetMonths: ['2027-02'] }],
      ['targetMonths acima de 24', {
        transactionIds: [randomUUID()],
        targetMonths: Array.from({ length: 25 }, (_, i) => `${2027 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`),
      }],
      ['uuid inválido', { transactionIds: ['abc'], targetMonths: ['2027-02'] }],
      ['transactionIds repetidos', (() => { const id = randomUUID(); return { transactionIds: [id, id], targetMonths: ['2027-02'] }; })()],
      ['targetMonths repetidos', { transactionIds: [randomUUID()], targetMonths: ['2027-02', '2027-02'] }],
      ['mês 13', { transactionIds: [randomUUID()], targetMonths: ['2027-13'] }],
      ['mês 00', { transactionIds: [randomUUID()], targetMonths: ['2027-00'] }],
      ['formato com dia', { transactionIds: [randomUUID()], targetMonths: ['2027-02-01'] }],
      ['formato sem zero', { transactionIds: [randomUUID()], targetMonths: ['2027-2'] }],
      ['transactionIds não é array', { transactionIds: randomUUID(), targetMonths: ['2027-02'] }],
      ['dryRun string', { ...valid(), dryRun: 'yes' }],
      ['dryRun string "false"', { ...valid(), dryRun: 'false' }],
      ['campo extra', { ...valid(), foo: 1 }],
    ])('retorna 400 para %s', async (_label, body) => {
      await http().post('/transactions/copy').send(body).expect(400);
    });

    it('aceita exatamente 24 meses e 500 ids (chega à regra de 404)', async () => {
      const body = {
        transactionIds: Array.from({ length: 500 }, () => randomUUID()),
        targetMonths: Array.from({ length: 24 }, (_, i) => `${2027 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`),
      };
      const res = await http().post('/transactions/copy').send(body).expect(404);
      expect(res.body.notFoundIds).toHaveLength(500);
    });
  });

  describe('fluxo completo', () => {
    it('dryRun=true retorna a prévia e não grava', async () => {
      const id = await createTransaction();

      const res = await http().post('/transactions/copy')
        .send({ transactionIds: [id], targetMonths: ['2027-02', '2028-02'], dryRun: true })
        .expect(200);

      expect(res.body).toEqual({
        dryRun: true,
        created: [
          { sourceId: id, targetMonth: '2027-02', description: 'Aluguel', amount: 1200, type: 'expense', dueDate: '2027-02-28', transactionDate: '2027-02-25' },
          { sourceId: id, targetMonth: '2028-02', description: 'Aluguel', amount: 1200, type: 'expense', dueDate: '2028-02-29', transactionDate: '2028-02-25' },
        ],
        skipped: [],
      });
      expect(await countTransactions()).toBe(1);
    });

    it('dryRun ausente grava as cópias como não efetivadas e reexecução pula duplicados', async () => {
      const id = await createTransaction();
      const body = { transactionIds: [id], targetMonths: ['2027-02', '2027-03'] };

      const first = await http().post('/transactions/copy').send(body).expect(200);
      expect(first.body.dryRun).toBe(false);
      expect(first.body.created.map((c: { dueDate: string }) => c.dueDate)).toEqual(['2027-02-28', '2027-03-31']);
      expect(first.body.skipped).toEqual([]);
      expect(await countTransactions()).toBe(3);

      const search = await http().get('/transactions/search')
        .query({ startDate: '2027-02-01', endDate: '2027-03-31' })
        .expect(200);
      expect(search.body.total).toBe(2);
      for (const tx of search.body.data) {
        expect(tx.settled).toBe(false);
        expect(tx.id).not.toBe(id);
      }

      const second = await http().post('/transactions/copy').send({ ...body, dryRun: false }).expect(200);
      expect(second.body.created).toEqual([]);
      expect(second.body.skipped).toEqual([
        { sourceId: id, targetMonth: '2027-02', dueDate: '2027-02-28', reason: 'duplicate' },
        { sourceId: id, targetMonth: '2027-03', dueDate: '2027-03-31', reason: 'duplicate' },
      ]);
      expect(await countTransactions()).toBe(3);
    });

    it('retorna 404 com notFoundIds e não cria nada', async () => {
      const id = await createTransaction();
      const missing = randomUUID();

      const res = await http().post('/transactions/copy')
        .send({ transactionIds: [id, missing], targetMonths: ['2027-02'] })
        .expect(404);

      expect(res.body.notFoundIds).toEqual([missing]);
      expect(await countTransactions()).toBe(1);
    });

    it('retorna 400 com transferIds para transferências e não cria nada', async () => {
      const id = await createTransaction();
      const transfer = await http().post('/transactions/transfer').send({
        debitAccountId: accountId,
        creditAccountId: accountId,
        categoryId: '12',
        transactionItemId: itemId,
        transactionDate: '2027-01-10',
        dueDate: '2027-01-10',
        amount: 100,
        settled: true,
      }).expect(201);

      const res = await http().post('/transactions/copy')
        .send({ transactionIds: [id, transfer.body.debit.id], targetMonths: ['2027-02'] })
        .expect(400);

      expect(res.body.transferIds).toEqual([transfer.body.debit.id]);
      expect(await countTransactions()).toBe(3);
    });
  });
});
