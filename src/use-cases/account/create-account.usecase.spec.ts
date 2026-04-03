import { InMemoryAccountRepository } from '../../infrastructure/persistence/in-memory/account.repository';
import { CreateAccountUseCase } from './create-account.usecase';

describe('CreateAccountUseCase', () => {
  it('should create an account', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const useCase = new CreateAccountUseCase(accountRepository as any);

    const account = await useCase.execute({
      name: 'Conta de Teste',
      description: 'Descrição de teste',
    });

    expect(account).toMatchObject({
      name: 'Conta de Teste',
      description: 'Descrição de teste',
    });
    expect(account.id).toBeDefined();
    expect(account.updatedAt).toBeInstanceOf(Date);
  });

  it('should not allow duplicate account names', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const useCase = new CreateAccountUseCase(accountRepository as any);

    await useCase.execute({
      name: 'Conta Existente',
      description: 'Primeira conta',
    });

    await expect(
      useCase.execute({
        name: 'Conta Existente',
        description: 'Segunda conta',
      }),
    ).rejects.toThrow('Account with name "Conta Existente" already exists');
  });
});
