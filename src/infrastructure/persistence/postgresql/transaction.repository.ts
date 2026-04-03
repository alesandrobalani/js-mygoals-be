import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRepository } from '../../../domain/repositories/transaction.repository';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { TransactionEntity } from './transaction.entity';

@Injectable()
export class PostgreSQLTransactionRepository implements TransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async create(transaction: Transaction): Promise<Transaction> {
    const entity = new TransactionEntity();
    entity.id = transaction.id;
    entity.description = transaction.description;
    entity.amount = transaction.amount;
    entity.type = transaction.type;
    entity.category = transaction.category;
    entity.transactionDate = transaction.transactionDate;
    entity.account = transaction.account;
    entity.dueDate = transaction.dueDate;

    const savedEntity = await this.transactionRepository.save(entity);

    return {
      id: savedEntity.id,
      description: savedEntity.description,
      amount: savedEntity.amount,
      type: savedEntity.type,
      category: savedEntity.category,
      transactionDate: savedEntity.transactionDate,
      account: savedEntity.account,
      createdAt: savedEntity.createdAt,
      dueDate: savedEntity.dueDate || savedEntity.transactionDate,
    };
  }

  async findAll(): Promise<Transaction[]> {
    const entities = await this.transactionRepository.find();
    return entities.map(entity => ({
      id: entity.id,
      description: entity.description,
      amount: entity.amount,
      type: entity.type,
      category: entity.category,
      transactionDate: entity.transactionDate,
      account: entity.account,
      createdAt: entity.createdAt,
      dueDate: entity.dueDate || entity.transactionDate,
    }));
  }

  async findById(id: string): Promise<Transaction | null> {
    const entity = await this.transactionRepository.findOne({ where: { id } });
    if (!entity) return null;

    return {
      id: entity.id,
      description: entity.description,
      amount: entity.amount,
      type: entity.type,
      category: entity.category,
      transactionDate: entity.transactionDate,
      account: entity.account,
      createdAt: entity.createdAt,
      dueDate: entity.dueDate || entity.transactionDate,
    };
  }
}