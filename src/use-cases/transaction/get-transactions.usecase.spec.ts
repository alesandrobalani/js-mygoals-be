import { InMemoryTransactionRepository } from '../../infrastructure/persistence/in-memory/transaction.repository';
import { GetTransactionsUseCase } from './get-transactions.usecase';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Account } from '../../domain/entities/account.entity';
import { Category } from '../../domain/entities/category.entity';
import { TransactionItem } from '../../domain/entities/transaction-item.entity';
import { TransactionType } from '../../dto/create-transaction.dto';
import { randomUUID } from 'crypto';

describe('GetTransactionsUseCase', () => {
  it('should return an empty array when no transactions exist', async () => {
    const transactionRepository = new InMemoryTransactionRepository();
    const useCase = new GetTransactionsUseCase(transactionRepository as any);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });

  it('should return all transactions', async () => {
    const transactionRepository = new InMemoryTransactionRepository();
    const useCase = new GetTransactionsUseCase(transactionRepository as any);

    const account = new Account('acc1', 'Conta', undefined, new Date());
    const category = new Category('cat1', 'Alimentação', undefined, new Date());
    const item = new TransactionItem('item1', 'Supermercado', undefined, new Date());

    await transactionRepository.create(new Transaction(
      randomUUID(), 'Compra', 150, TransactionType.EXPENSE,
      category, item, new Date(), account, new Date(), new Date(),
    ));
    await transactionRepository.create(new Transaction(
      randomUUID(), 'Salário', 5000, TransactionType.INCOME,
      category, item, new Date(), account, new Date(), new Date(),
    ));

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
  });
});
