import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories } from '../../test-utils/test-datasource';
import { PostgreSQLAccountRepository } from '../../infrastructure/persistence/postgresql/account.repository';
import { AccountEntity } from '../../infrastructure/persistence/postgresql/account.entity';
import { CreateAccountUseCase } from './create-account.usecase';

describe('CreateAccountUseCase', () => {
  let dataSource: DataSource;
  let accountRepository: PostgreSQLAccountRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    accountRepository = createTestRepositories(dataSource).accountRepository;
  });

  afterAll(async () => { await dataSource.destroy(); });
  beforeEach(async () => { await dataSource.getRepository(AccountEntity).clear(); });

  it('should create an account', async () => {
    const useCase = new CreateAccountUseCase(accountRepository as any);

    const account = await useCase.execute({
      name: 'Conta de Teste',
      description: 'DescriÃ§Ã£o de teste',
    });

    expect(account).toMatchObject({
      name: 'Conta de Teste',
      description: 'DescriÃ§Ã£o de teste',
    });
    expect(account.id).toBeDefined();
    expect(account.updatedAt).toBeInstanceOf(Date);
  });

  it('should not allow duplicate account names', async () => {
    const useCase = new CreateAccountUseCase(accountRepository as any);

    await useCase.execute({ name: 'Conta Existente', description: 'Primeira conta' });

    await expect(
      useCase.execute({ name: 'Conta Existente', description: 'Segunda conta' }),
    ).rejects.toThrow('Account with name "Conta Existente" already exists');
  });
});
