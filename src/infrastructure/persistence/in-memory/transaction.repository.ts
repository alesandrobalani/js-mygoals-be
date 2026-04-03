import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { TransactionRepository } from '../../../domain/repositories/transaction.repository';
import { CreateTransactionDto } from '../../../dto/create-transaction.dto';

@Injectable()
export class InMemoryTransactionRepository implements TransactionRepository {
  private transactions: Transaction[] = [];

  async create(payload: CreateTransactionDto): Promise<Transaction> {
    const transaction = new Transaction(
      uuidv4(),
      payload.description,
      payload.amount,
      payload.type,
      payload.category,
      new Date(),
    );
    this.transactions.push(transaction);
    return transaction;
  }

  async findAll(): Promise<Transaction[]> {
    return [...this.transactions];
  }
}
