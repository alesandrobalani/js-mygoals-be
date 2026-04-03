import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionRepository } from '../../domain/repositories/transaction.repository';

@Injectable()
export class GetTransactionsUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(): Promise<Transaction[]> {
    return this.transactionRepository.findAll();
  }
}
