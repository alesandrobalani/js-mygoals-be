import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
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
    const transaction = new Transaction(      
        uuidv4(),
        payload.description,
        payload.amount,
        payload.type,
        payload.category,
        payload.transactionDate,
        payload.account,
        new Date(),
        payload.dueDate !== undefined ? payload.dueDate : payload.transactionDate,
    );
    return this.transactionRepository.create(transaction);
  }
}
