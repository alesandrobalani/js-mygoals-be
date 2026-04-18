import { InMemoryAccountRepository } from '../../infrastructure/persistence/in-memory/account.repository';
import { UpdateAccountUseCase } from './update-account.usecase';
import { Account } from '../../domain/entities/account.entity';

describe('UpdateAccountUseCase', () => {
  it('should update an account successfully', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const useCase = new UpdateAccountUseCase(accountRepository as any);

    // Create an account first
    const originalAccount = await accountRepository.create({
      id: 'test-account',
      name: 'Original Name',
      description: 'Original description',
      updatedAt: new Date('2024-01-01'),
    });

    // Update the account
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
    expect(updatedAccount.updatedAt.getTime()).toBeGreaterThan(originalAccount.updatedAt.getTime());
  });

  it('should update an account without changing description', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const useCase = new UpdateAccountUseCase(accountRepository as any);

    // Create an account first
    const originalAccount = await accountRepository.create({
      id: 'test-account-2',
      name: 'Original Name',
      description: 'Original description',
      updatedAt: new Date(),
    });

    // Update only the name
    const updatedAccount = await useCase.execute({
      id: originalAccount.id,
      name: 'Updated Name Only',
      // description not provided, should keep original
    });

    expect(updatedAccount).toMatchObject({
      id: originalAccount.id,
      name: 'Updated Name Only',
      description: 'Original description', // Should keep original
    });
    expect(updatedAccount.updatedAt).toBeInstanceOf(Date);
  });

  it('should throw error when account not found', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const useCase = new UpdateAccountUseCase(accountRepository as any);

    await expect(
      useCase.execute({
        id: 'non-existent-id',
        name: 'New Name',
        description: 'New description',
      }),
    ).rejects.toThrow('Account with ID "non-existent-id" not found');
  });
});