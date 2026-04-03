import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRepository } from '../../../domain/repositories/transaction.repository';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { TransactionEntity } from './transaction.entity';

@Injectable()
export class PostgreSQLTransactionRepository implements TransactionRepository {
  private readonly logger = new Logger(PostgreSQLTransactionRepository.name);

  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async create(transaction: Transaction): Promise<Transaction> {
    this.logger.debug(`Creating transaction in database: ${transaction.id}`, 'PostgreSQLTransactionRepository');

    const entity = new TransactionEntity();
    entity.id = transaction.id;
    entity.description = transaction.description;
    entity.amount = transaction.amount;
    entity.type = transaction.type;
    entity.categoryId = transaction.category.id;
    entity.transactionDate = transaction.transactionDate;
    entity.account = transaction.account;
    entity.dueDate = transaction.dueDate;

    try {
      const savedEntity = await this.transactionRepository.save(entity);
      this.logger.debug(`Transaction saved successfully: ${savedEntity.id}`, 'PostgreSQLTransactionRepository');

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to save transaction ${transaction.id}: ${errorMessage}`, errorStack, 'PostgreSQLTransactionRepository');
      throw error;
    }
  }

  async findAll(): Promise<Transaction[]> {
    this.logger.debug('Retrieving all transactions from database', 'PostgreSQLTransactionRepository');

    try {
      const entities = await this.transactionRepository.find({
        relations: ['category'],
      });
      this.logger.debug(`Retrieved ${entities.length} transactions from database`, 'PostgreSQLTransactionRepository');

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve transactions: ${errorMessage}`, errorStack, 'PostgreSQLTransactionRepository');
      throw error;
    }
  }

  async findById(id: string): Promise<Transaction | null> {
    this.logger.debug(`Retrieving transaction by ID: ${id}`, 'PostgreSQLTransactionRepository');

    try {
      const entity = await this.transactionRepository.findOne({ 
        where: { id },
        relations: ['category'],
      });
      if (!entity) {
        this.logger.debug(`Transaction not found: ${id}`, 'PostgreSQLTransactionRepository');
        return null;
      }

      this.logger.debug(`Transaction found: ${id}`, 'PostgreSQLTransactionRepository');
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve transaction ${id}: ${errorMessage}`, errorStack, 'PostgreSQLTransactionRepository');
      throw error;
    }
  }
}