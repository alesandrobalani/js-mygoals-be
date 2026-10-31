import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { randomUUID } from 'crypto';
import { createTestDataSource, createTestRepositories, seedTestCategories } from '../../test-utils/test-datasource';
import { PostgreSQLTransactionRepository } from '../../infrastructure/persistence/postgresql/transaction.repository';
import { PostgreSQLTransactionItemRepository } from '../../infrastructure/persistence/postgresql/transaction-item.repository';
import { PostgreSQLAccountRepository } from '../../infrastructure/persistence/postgresql/account.repository';
import { PostgreSQLCategoryRepository } from '../../infrastructure/persistence/postgresql/category.repository';
import { TransactionEntity } from '../../infrastructure/persistence/postgresql/transaction.entity';
import { AccountEntity } from '../../infrastructure/persistence/postgresql/account.entity';
import { TransactionItemEntity } from '../../infrastructure/persistence/postgresql/transaction-item.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { Account } from '../../domain/entities/account.entity';
import { TransactionType } from '../../dto/create-transaction.dto';
import { fromDateOnly, toDateOnly } from '../../utils/date-only';
import { CopyTransactionsUseCase } from './copy-transactions.usecase';

describe('CopyTransactionsUseCase', () => {
  let dataSource: DataSource;
  let transactionRepository: PostgreSQLTransactionRepository;
  let transactionItemRepository: PostgreSQLTransactionItemRepository;
  let accountRepository: PostgreSQLAccountRepository;
  let categoryRepository: PostgreSQLCategoryRepository;
  let useCase: CopyTransactionsUseCase;
  let account: Account;
  let item: TransactionItem;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    const repos = createTestRepositories(dataSource);
    transactionRepository = repos.transactionRepository;
    transactionItemRepository = repos.transactionItemRepository;
    accountRepository = repos.accountRepository;
    categoryRepository = repos.categoryRepository;
    await seedTestCategories(dataSource);
    useCase = new CopyTransactionsUseCase(transactionRepository);
  });

  afterAll(async () => { await dataSource.destroy(); });

  beforeEach(async () => {
    jest.restoreAllMocks();
    await dataSource.getRepository(TransactionEntity).clear();
    await dataSource.getRepository(AccountEntity).clear();
    await dataSource.getRepository(TransactionItemEntity).clear();
    account = await accountRepository.create({ id: randomUUID(), name: 'Conta', description: undefined, updatedAt: new Date() });
    item = await transactionItemRepository.create(new TransactionItem(randomUUID(), 'Item', undefined, new Date()));
  });

  const seed = async (overrides: {
    description?: string;
    amount?: number;
    type?: TransactionType;
    categoryId?: string;
    transactionDate?: string;
    dueDate?: string;
    settled?: boolean;
  } = {}): Promise<Transaction> => {
    const category = (await categoryRepository.findById(overrides.categoryId ?? '1'))!;
    return transactionRepository.create(new Transaction(
      randomUUID(),
      'description' in overrides ? overrides.description : 'Aluguel',
      overrides.amount ?? 1200,
      overrides.type ?? TransactionType.EXPENSE,
      category,
      item,
      fromDateOnly(overrides.transactionDate ?? '2026-10-05'),
      account,
      new Date(),
      fromDateOnly(overrides.dueDate ?? '2026-10-10'),
      overrides.settled ?? true,
    ));
  };

  const countTransactions = () => dataSource.getRepository(TransactionEntity).count();

  const findByDueDate = async (dueDate: string) => {
    const all = await transactionRepository.findAllByDueDateRange(dueDate, dueDate);
    return all;
  };

  describe('happy flow', () => {
    it('copia para um mês, com settled=false, novo id e mesmos dados', async () => {
      const source = await seed();

      const result = await useCase.execute({ transactionIds: [source.id], targetMonths: ['2026-11'] });

      expect(result).toEqual({
        dryRun: false,
        created: [{
          sourceId: source.id,
          targetMonth: '2026-11',
          description: 'Aluguel',
          amount: 1200,
          type: TransactionType.EXPENSE,
          dueDate: '2026-11-10',
          transactionDate: '2026-11-05',
        }],
        skipped: [],
      });

      const [copy] = await findByDueDate('2026-11-10');
      expect(copy).toBeDefined();
      expect(copy.id).not.toBe(source.id);
      expect(copy.settled).toBe(false);
      expect(copy.description).toBe('Aluguel');
      expect(Number(copy.amount)).toBe(1200);
      expect(copy.type).toBe(TransactionType.EXPENSE);
      expect(copy.account.id).toBe(account.id);
      expect(copy.category.id).toBe('1');
      expect(copy.transactionItem.id).toBe(item.id);
      expect(toDateOnly(copy.transactionDate)).toBe('2026-11-05');
      expect(await countTransactions()).toBe(2);
    });

    it('copia vários lançamentos para vários meses (origem x mês)', async () => {
      const a = await seed({ description: 'A' });
      const b = await seed({ description: 'B', type: TransactionType.INCOME, categoryId: '9' });

      const result = await useCase.execute({
        transactionIds: [a.id, b.id],
        targetMonths: ['2026-11', '2026-12', '2027-01'],
      });

      expect(result.created).toHaveLength(6);
      expect(result.skipped).toHaveLength(0);
      expect(result.created.map(c => `${c.sourceId}:${c.dueDate}`)).toEqual([
        `${a.id}:2026-11-10`, `${a.id}:2026-12-10`, `${a.id}:2027-01-10`,
        `${b.id}:2026-11-10`, `${b.id}:2026-12-10`, `${b.id}:2027-01-10`,
      ]);
      expect(await countTransactions()).toBe(8);
    });

    it('ajusta o vencimento para o último dia do mês (31/01 → 28/02 e 29/02 em ano bissexto)', async () => {
      const source = await seed({ transactionDate: '2027-01-31', dueDate: '2027-01-31' });

      const result = await useCase.execute({ transactionIds: [source.id], targetMonths: ['2027-02', '2028-02', '2027-04'] });

      expect(result.created.map(c => c.dueDate)).toEqual(['2027-02-28', '2028-02-29', '2027-04-30']);
      expect(result.created.map(c => c.transactionDate)).toEqual(['2027-02-28', '2028-02-29', '2027-04-30']);
    });

    it('desloca a transactionDate pelo mesmo número de meses, mantendo a diferença para o vencimento', async () => {
      const source = await seed({ transactionDate: '2026-09-28', dueDate: '2026-10-10' });

      const result = await useCase.execute({ transactionIds: [source.id], targetMonths: ['2026-11', '2027-03'] });

      expect(result.created.map(c => [c.transactionDate, c.dueDate])).toEqual([
        ['2026-10-28', '2026-11-10'],
        ['2027-02-28', '2027-03-10'],
      ]);
    });

    it('com dryRun=true retorna a prévia sem gravar nada', async () => {
      const source = await seed();

      const result = await useCase.execute({ transactionIds: [source.id], targetMonths: ['2026-11', '2026-12'], dryRun: true });

      expect(result.dryRun).toBe(true);
      expect(result.created).toHaveLength(2);
      expect(await countTransactions()).toBe(1);
    });

    it('pula duplicados já existentes no banco e informa na resposta', async () => {
      const source = await seed();
      await seed({ dueDate: '2026-11-10', transactionDate: '2026-11-05', settled: false });

      const result = await useCase.execute({ transactionIds: [source.id], targetMonths: ['2026-11', '2026-12'] });

      expect(result.skipped).toEqual([{ sourceId: source.id, targetMonth: '2026-11', dueDate: '2026-11-10', reason: 'duplicate' }]);
      expect(result.created.map(c => c.dueDate)).toEqual(['2026-12-10']);
      expect(await countTransactions()).toBe(3);
    });

    it('não considera duplicado quando algum campo da chave difere', async () => {
      const source = await seed();
      await seed({ dueDate: '2026-11-10', amount: 1200.01 });
      await seed({ dueDate: '2026-11-10', description: 'Outro' });

      const result = await useCase.execute({ transactionIds: [source.id], targetMonths: ['2026-11'] });

      expect(result.created).toHaveLength(1);
      expect(result.skipped).toHaveLength(0);
    });

    it('trata colisão dentro do mesmo lote como duplicado', async () => {
      const a = await seed();
      const b = await seed({ dueDate: '2026-09-10', transactionDate: '2026-09-05' });

      const result = await useCase.execute({ transactionIds: [a.id, b.id], targetMonths: ['2026-11'] });

      expect(result.created).toEqual([expect.objectContaining({ sourceId: a.id, dueDate: '2026-11-10' })]);
      expect(result.skipped).toEqual([{ sourceId: b.id, targetMonth: '2026-11', dueDate: '2026-11-10', reason: 'duplicate' }]);
    });

    it('permite mês de destino igual à competência de origem (vira duplicado da própria origem)', async () => {
      const source = await seed();

      const result = await useCase.execute({ transactionIds: [source.id], targetMonths: ['2026-10'] });

      expect(result.created).toHaveLength(0);
      expect(result.skipped).toEqual([{ sourceId: source.id, targetMonth: '2026-10', dueDate: '2026-10-10', reason: 'duplicate' }]);
    });

    it('copia lançamento sem descrição', async () => {
      const source = await seed({ description: undefined });

      const result = await useCase.execute({ transactionIds: [source.id], targetMonths: ['2026-11'] });

      expect(result.created).toHaveLength(1);
      expect(result.created[0].description).toBeUndefined();
    });
  });

  describe('bad flow', () => {
    it('retorna 404 com os ids inexistentes e não cria nada', async () => {
      const source = await seed();
      const missing = randomUUID();

      const promise = useCase.execute({ transactionIds: [source.id, missing], targetMonths: ['2026-11'] });

      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toMatchObject({ response: { notFoundIds: [missing] } });
      expect(await countTransactions()).toBe(1);
    });

    it('recusa transferências com 400 listando-as e não cria nada', async () => {
      const normal = await seed();
      const transfer = await seed({ categoryId: '12' });

      const promise = useCase.execute({ transactionIds: [normal.id, transfer.id], targetMonths: ['2026-11'] });

      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toMatchObject({ response: { transferIds: [transfer.id] } });
      expect(await countTransactions()).toBe(2);
    });

    it('faz rollback de todas as cópias quando a gravação falha no meio', async () => {
      const source = await seed();
      const originalSave = EntityManager.prototype.save;
      let calls = 0;
      jest.spyOn(EntityManager.prototype, 'save').mockImplementation(function (this: EntityManager, ...args: unknown[]) {
        calls++;
        if (calls === 2) {
          return Promise.reject(new Error('falha simulada'));
        }
        return (originalSave as (...a: unknown[]) => Promise<unknown>).apply(this, args);
      } as never);

      await expect(
        useCase.execute({ transactionIds: [source.id], targetMonths: ['2026-11', '2026-12', '2027-01'] }),
      ).rejects.toThrow('falha simulada');

      jest.restoreAllMocks();
      expect(calls).toBe(2);
      expect(await countTransactions()).toBe(1);
    });
  });
});
