import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories } from '../../test-utils/test-datasource';
import { PostgreSQLAccountRepository } from '../../infrastructure/persistence/postgresql/account.repository';
import { AccountEntity } from '../../infrastructure/persistence/postgresql/account.entity';
import { Account } from '../../domain/entities/account.entity';
import { GetAccountsUseCase } from './get-accounts.usecase';
import { randomUUID } from 'crypto';

describe('GetAccountsUseCase', () => {
  let dataSource: DataSource;
  let accountRepository: PostgreSQLAccountRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    accountRepository = createTestRepositories(dataSource).accountRepository;
  });

  afterAll(async () => { await dataSource.destroy(); });
  beforeEach(async () => { await dataSource.getRepository(AccountEntity).clear(); });

  it('should return an empty array when no accounts exist', async () => {
    const useCase = new GetAccountsUseCase(accountRepository as any);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });

  it('should return all accounts', async () => {
    const useCase = new GetAccountsUseCase(accountRepository as any);

    await accountRepository.create(new Account(randomUUID(), 'Conta Corrente', 'Conta principal', new Date()));
    await accountRepository.create(new Account(randomUUID(), 'PoupanÃ§a', undefined, new Date()));

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result.map(a => a.name)).toEqual(expect.arrayContaining(['Conta Corrente', 'PoupanÃ§a']));
  });
});
