import { DataSource } from 'typeorm';
import { createTestDataSource, createTestRepositories } from '../../test-utils/test-datasource';
import { PostgreSQLAccountRepository } from '../../infrastructure/persistence/postgresql/account.repository';
import { AccountEntity } from '../../infrastructure/persistence/postgresql/account.entity';
import { UpdateAccountUseCase } from './update-account.usecase';
import { randomUUID } from 'crypto';

describe('UpdateAccountUseCase', () => {
  let dataSource: DataSource;
  let accountRepository: PostgreSQLAccountRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    accountRepository = createTestRepositories(dataSource).accountRepository;
  });

  afterAll(async () => { await dataSource.destroy(); });
  beforeEach(async () => { await dataSource.getRepository(AccountEntity).clear(); });

  it('should update an account successfully', async () => {
    const useCase = new UpdateAccountUseCase(accountRepository as any);

    const originalAccount = await accountRepository.create({
      id: randomUUID(),
      name: 'Original Name',
      description: 'Original description',
      updatedAt: new Date(),
    });

    await new Promise(r => setTimeout(r, 5));

    const updatedAccount = await useCase.execute({
      id: originalAccount.id,
      name: 'Updated Name',
      description: 'Updated description',
    });

    expect(updatedAccount).toMatchObject({
      id: originalAccount.id,
      name: 'Updated Name',
      description: 'Updated description',
    });
    expect(updatedAccount.updatedAt).toBeInstanceOf(Date);
    const updatedSec = Math.floor(updatedAccount.updatedAt.getTime() / 1000);
    const originalSec = Math.floor(originalAccount.updatedAt.getTime() / 1000);
    expect(updatedSec).toBeGreaterThanOrEqual(originalSec);
  });

  it('should update an account without changing description', async () => {
    const useCase = new UpdateAccountUseCase(accountRepository as any);

    const originalAccount = await accountRepository.create({
      id: randomUUID(),
      name: 'Original Name',
      description: 'Original description',
      updatedAt: new Date(),
    });

    const updatedAccount = await useCase.execute({
      id: originalAccount.id,
      name: 'Updated Name Only',
    });

    expect(updatedAccount).toMatchObject({
      id: originalAccount.id,
      name: 'Updated Name Only',
      description: 'Original description',
    });
    expect(updatedAccount.updatedAt).toBeInstanceOf(Date);
  });

  it('should throw error when account not found', async () => {
    const useCase = new UpdateAccountUseCase(accountRepository as any);

    await expect(
      useCase.execute({ id: 'non-existent-id', name: 'New Name', description: 'New description' }),
    ).rejects.toThrow('Account with ID "non-existent-id" not found');
  });
});
