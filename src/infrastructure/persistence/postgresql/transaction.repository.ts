import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { TransactionRepository, TransactionByTypeAndSettledSummary, PaginatedTransactions } from '../../../domain/repositories/transaction.repository';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { Account } from '../../../domain/entities/account.entity';
import { TransactionItem } from '../../../domain/entities/transaction-item.entity';
import { TransactionEntity } from './transaction.entity';
import { TransactionItemEntity } from './transaction-item.entity';

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
    entity.description = transaction.description ?? null;
    entity.amount = transaction.amount;
    entity.type = transaction.type;
    entity.categoryId = transaction.category.id;
    entity.transactionItemId = transaction.transactionItem.id;
    entity.accountId = transaction.account.id;
    entity.transactionDate = transaction.transactionDate;
    entity.dueDate = transaction.dueDate;
    entity.settled = transaction.settled;

    try {
      const savedEntity = await this.transactionRepository.save(entity);
      this.logger.debug(`Transaction saved successfully: ${savedEntity.id}`, 'PostgreSQLTransactionRepository');

      const loadedEntity = await this.transactionRepository.findOne({
        where: { id: savedEntity.id },
        relations: ['category', 'account', 'transactionItem'],
      });
      if (!loadedEntity) {
        throw new Error(`Failed to load saved transaction ${savedEntity.id}`);
      }

      return {
        id: loadedEntity.id,
        description: loadedEntity.description || undefined,
        amount: loadedEntity.amount,
        type: loadedEntity.type,
        category: loadedEntity.category,
        transactionItem: new TransactionItem(
          loadedEntity.transactionItem.id,
          loadedEntity.transactionItem.name,
          loadedEntity.transactionItem.description,
          loadedEntity.transactionItem.updatedAt,
        ),
        transactionDate: loadedEntity.transactionDate,
        account: loadedEntity.account,
        updatedAt: loadedEntity.updatedAt,
        dueDate: loadedEntity.dueDate || loadedEntity.transactionDate,
        settled: loadedEntity.settled
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
        relations: ['category', 'account', 'transactionItem'],
      });
      this.logger.debug(`Retrieved ${entities.length} transactions from database`, 'PostgreSQLTransactionRepository');

      return entities.map(entity => ({
        id: entity.id,
        description: entity.description || undefined,
        amount: entity.amount,
        type: entity.type,
        category: entity.category,
        transactionItem: new TransactionItem(
          entity.transactionItem.id,
          entity.transactionItem.name,
          entity.transactionItem.description,
          entity.transactionItem.updatedAt,
        ),
        transactionDate: entity.transactionDate,
        account: entity.account,
        updatedAt: entity.updatedAt,
        dueDate: entity.dueDate || entity.transactionDate,
        settled: entity.settled
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
        relations: ['category', 'account', 'transactionItem'],
      });
      if (!entity) {
        this.logger.debug(`Transaction not found: ${id}`, 'PostgreSQLTransactionRepository');
        return null;
      }

      this.logger.debug(`Transaction found: ${id}`, 'PostgreSQLTransactionRepository');
      return {
        id: entity.id,
        description: entity.description || undefined,
        amount: entity.amount,
        type: entity.type,
        category: entity.category,
        transactionItem: new TransactionItem(
          entity.transactionItem.id,
          entity.transactionItem.name,
          entity.transactionItem.description,
          entity.transactionItem.updatedAt,
        ),
        transactionDate: entity.transactionDate,
        account: entity.account,
        updatedAt: entity.updatedAt,
        dueDate: entity.dueDate || entity.transactionDate,
        settled: entity.settled
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to retrieve transaction ${id}: ${errorMessage}`, errorStack, 'PostgreSQLTransactionRepository');
      throw error;
    }
  }
  
  async existsByAccountId(accountId: string): Promise<boolean> {
    return this.transactionRepository.exists({ where: { accountId } });
  }

  async existsByTransactionItemId(transactionItemId: string): Promise<boolean> {
    return this.transactionRepository.exists({ where: { transactionItemId } });
  }

  async findByPeriod(startDate: Date, endDate: Date, page: number, limit: number): Promise<PaginatedTransactions> {
    this.logger.debug(`Searching transactions from ${startDate} to ${endDate} page=${page} limit=${limit}`, 'PostgreSQLTransactionRepository');

    const skip = (page - 1) * limit;

    const [entities, total] = await this.transactionRepository.findAndCount({
      where: { transactionDate: Between(startDate, endDate) },
      relations: ['category', 'account', 'transactionItem'],
      order: { transactionDate: 'DESC' },
      skip,
      take: limit,
    });

    const data = entities.map(entity => ({
      id: entity.id,
      description: entity.description || undefined,
      amount: entity.amount,
      type: entity.type,
      category: entity.category,
      transactionItem: new TransactionItem(
        entity.transactionItem.id,
        entity.transactionItem.name,
        entity.transactionItem.description,
        entity.transactionItem.updatedAt,
      ),
      transactionDate: entity.transactionDate,
      account: entity.account,
      updatedAt: entity.updatedAt,
      dueDate: entity.dueDate || entity.transactionDate,
      settled: entity.settled
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findSumByPeriodGroupByTypeAndSettled(startDate: Date, endDate: Date): Promise<TransactionByTypeAndSettledSummary> {
    this.logger.debug(`Retrieving transaction summary from ${startDate} to ${endDate}`, 'PostgreSQLTransactionRepository');

    const rows = await this.transactionRepository
      .createQueryBuilder('t')
      .select('t.type', 'type')
      .addSelect('SUM(t.amount)', 'total')
      .where('t.transactionDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('t.type')
      .addGroupBy('t.settled')
      .getRawMany<{ type: string; settled: boolean; total: string }>();

    const result: TransactionByTypeAndSettledSummary = { incomeSettled: 0, incomeNotSettled: 0, expenseSettled: 0, expenseNotSettled: 0 };
    for (const row of rows) {
      if (row.type === 'income' && row.settled) result.incomeSettled = Number(row.total);
      if (row.type === 'income' && !row.settled) result.incomeNotSettled = Number(row.total);
      if (row.type === 'expense' && row.settled) result.expenseSettled = Number(row.total);
      if (row.type === 'expense' && !row.settled) result.expenseNotSettled = Number(row.total);
    }
    return result;
  }
}