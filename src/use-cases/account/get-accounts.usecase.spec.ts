import { InMemoryAccountRepository } from '../../infrastructure/persistence/in-memory/account.repository';
import { GetAccountsUseCase } from './get-accounts.usecase';
import { Account } from '../../domain/entities/account.entity';

describe('GetAccountsUseCase', () => {
  it('should return an empty array when no accounts exist', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const useCase = new GetAccountsUseCase(accountRepository as any);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });

  it('should return all accounts', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const useCase = new GetAccountsUseCase(accountRepository as any);

    await accountRepository.create(new Account('1', 'Conta Corrente', 'Conta principal', new Date()));
    await accountRepository.create(new Account('2', 'Poupança', undefined, new Date()));

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result.map(a => a.id)).toEqual(expect.arrayContaining(['1', '2']));
  });
});
