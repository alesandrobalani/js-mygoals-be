import { Inject, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionRepository } from '../../domain/repositories/transaction.repository';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(payload: CreateTransactionDto): Promise<Transaction> {
    return this.transactionRepository.create(payload);
  }
}
