import { InMemoryAccountRepository } from '../../infrastructure/persistence/in-memory/account.repository';
import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';
import { DeleteAccountUseCase } from './delete-account.usecase';
import { Account } from '../../domain/entities/account.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Category } from '../../domain/entities/category.entity';
import { TransactionType } from '../../dto/create-transaction.dto';
import { randomUUID } from 'crypto';

describe('DeleteAccountUseCase', () => {
  it('should delete an account successfully', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const transactionRepository = new InMemoryTransactionRepository();
    const useCase = new DeleteAccountUseCase(accountRepository as any, transactionRepository as any);

    const account = await accountRepository.create({
      id: 'test-account',
      name: 'Test Account',
      description: 'Account for deletion test',
      updatedAt: new Date(),
    });

    await useCase.execute(account.id);

    const foundAccount = await accountRepository.findById(account.id);
    expect(foundAccount).toBeNull();
  });

  it('should throw error when account not found', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const transactionRepository = new InMemoryTransactionRepository();
    const useCase = new DeleteAccountUseCase(accountRepository as any, transactionRepository as any);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow('Account with ID "non-existent-id" not found');
  });

  it('should not allow deleting an account with associated transactions', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const transactionRepository = new InMemoryTransactionRepository();
    const useCase = new DeleteAccountUseCase(accountRepository as any, transactionRepository as any);

    const account = await accountRepository.create({
      id: 'test-account-with-transaction',
      name: 'Account With Transaction',
      description: 'Account that has transactions',
      updatedAt: new Date(),
    });

    // Create a transaction associated with this account
    const category = new Category('1', 'Test Category', 'Category for test', new Date());
    const transaction = new Transaction(
      randomUUID(),
      'Test Transaction',
      100,
      TransactionType.EXPENSE,
      category,
      new Date(),
      account,
      new Date(),
      new Date(),
    );

    await transactionRepository.create(transaction);

    await expect(useCase.execute(account.id)).rejects.toThrow('Cannot delete account "Account With Transaction" because it has 1 associated transaction(s)');
  });
});